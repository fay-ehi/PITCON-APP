-- ============================================================================
-- Fix: infinite recursion in profiles/startups/startup_interests RLS
-- ============================================================================
-- Reproduced against a fresh Postgres 16 instance loaded with ONLY the
-- pre-Sprint-12 migrations (Sprints 1-10, nothing from Sprint 12) to
-- confirm this is a latent Sprint 5/6 bug, not something Sprint 12
-- introduced - Sprint 12's two new `profiles`/`investor_profiles`
-- policies deepen the same underlying problem, but a completely clean
-- checkout of everything through Sprint 10 already fails on a bare
-- `select id from public.startups limit 1` (no join, no `profiles`
-- involved at all) with "infinite recursion detected in policy for
-- relation startups".
--
-- Two independent cycles, both fixed the same way:
--
--   1. `public.startups`."Investors can read startups they've
--      expressed interest in" (Sprint 6) reads `startup_interests`
--      inline, and `public.startup_interests`."Founders can read/
--      respond to interests for own startups" (also Sprint 6) reads
--      `startups` inline. Postgres rewrites a policy's subquery by
--      re-applying row security to every table it touches, so
--      evaluating either table's policies requires re-evaluating the
--      other's, forever.
--
--   2. `public.startups`."Investors can read published startups"
--      (Sprint 5) reads `public.profiles` inline to check
--      `role = 'investor'`. Once any policy on `profiles` also reads
--      `startups` - Sprint 6's "Founders can read profiles of
--      investors interested in their startups" already does; Sprint
--      12's Founder Analytics policies added a second one - that's a
--      second, independent `profiles` <-> `startups` cycle.
--
-- The fix for both is the standard Postgres/Supabase pattern: replace
-- the inline cross-table subquery with a call to a `security definer`
-- helper function. A function call is opaque to the policy rewriter -
-- it isn't expanded and re-checked for row security the way an inline
-- subquery is - and because the function runs as its owner (the
-- migration role, which owns every table here and so isn't subject to
-- any of their RLS), the lookup inside it doesn't re-trigger policy
-- evaluation on `profiles`/`startups` either. This changes nothing
-- about who can see what - each function reimplements exactly the
-- check the inline subquery it replaces did - it only changes how
-- Postgres plans it.
-- ============================================================================

create or replace function public.get_user_role(user_id uuid)
returns public.user_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = user_id
$$;

comment on function public.get_user_role is
  'Row-security helper: looks up a user''s role bypassing RLS, so a '
  'policy that needs "is this user an investor" (e.g. "Investors can '
  'read published startups") never has to read `profiles` through its '
  'own RLS - see this migration''s header for why that specifically '
  'causes infinite recursion once any policy on `profiles` reads back '
  'from `startups`.';

create or replace function public.is_own_startup(p_startup_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.startups s
    where s.id = p_startup_id and s.founder_id = auth.uid()
  )
$$;

comment on function public.is_own_startup is
  'Row-security helper: "does the signed-in user own this startup", '
  'bypassing RLS - lets a policy on another table (startup_interests, '
  'messages, notifications, etc) check startup ownership without '
  'forcing Postgres to re-evaluate every policy on `startups` itself, '
  'which is what caused the startups<->startup_interests recursion '
  'this migration fixes. New policies needing this same check should '
  'call this function rather than repeating the inline subquery.';

-- ----------------------------------------------------------------------------
-- Break startups <-> startup_interests
-- ----------------------------------------------------------------------------
drop policy "Investors can read published startups" on public.startups;
create policy "Investors can read published startups"
  on public.startups
  for select
  to authenticated
  using (
    status = 'published'
    and public.get_user_role(auth.uid()) = 'investor'
  );

drop policy "Founders can read interests for own startups" on public.startup_interests;
create policy "Founders can read interests for own startups"
  on public.startup_interests
  for select
  to authenticated
  using (public.is_own_startup(startup_id));

drop policy "Founders can respond to interests for own startups" on public.startup_interests;
create policy "Founders can respond to interests for own startups"
  on public.startup_interests
  for update
  to authenticated
  using (public.is_own_startup(startup_id))
  with check (public.is_own_startup(startup_id));

-- ----------------------------------------------------------------------------
-- Cosmetic: three policy names (one from Sprint 6, two from Sprint 12)
-- exceeded Postgres's 63-byte identifier limit and were silently
-- truncated - a NOTICE, not an error, at migration time, and unrelated
-- to the recursion above, but fixed here since it's the same area of
-- the schema and leaves `pg_policies` readable.
-- ----------------------------------------------------------------------------
drop policy "Founders can read profiles of investors interested in their sta" on public.profiles;
create policy "Founders can read profiles of interested investors"
  on public.profiles
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.startup_interests si
      join public.startups s on s.id = si.startup_id
      where si.investor_id = profiles.id
        and s.founder_id = auth.uid()
    )
  );

drop policy "Founders can read profiles of investors who viewed their startu" on public.profiles;
create policy "Founders can read profiles of startup viewers"
  on public.profiles
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.startup_views sv
      join public.startups s on s.id = sv.startup_id
      where sv.investor_id = profiles.id
        and s.founder_id = auth.uid()
    )
  );

drop policy "Founders can read investor profiles for viewers of their startu" on public.investor_profiles;
create policy "Founders can read investor profiles for startup viewers"
  on public.investor_profiles
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.startup_views sv
      join public.startups s on s.id = sv.startup_id
      where sv.investor_id = investor_profiles.id
        and s.founder_id = auth.uid()
    )
  );
