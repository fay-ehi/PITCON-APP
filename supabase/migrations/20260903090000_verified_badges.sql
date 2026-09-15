-- ============================================================================
-- Sprint 13: Verified Badges (Trust & Credibility layer, part 1 of 3)
-- ============================================================================
-- Deliberately the simplest version of this feature: a plain boolean on
-- each profile type, toggled only by an admin from `/admin/users` via
-- the service-role client (see lib/queries/admin.ts's own comment on
-- why admin writes don't go through RLS at all). No self-serve
-- verification-request submission flow in this pass - "manual admin
-- review" was explicitly an acceptable option, and a submission UI +
-- review queue is its own scope, deferred rather than half-built.
--
-- The harder part of this feature isn't the column, it's visibility:
--   - A founder already has a way to see an investor's verified badge
--     with zero new RLS - "Founders can read investor profiles for
--     their interests"/"...for startup viewers" (Sprint 6/12) already
--     let a founder read the relevant investor_profiles row; this
--     migration only needs to add the new column, the existing
--     policies cover it automatically (RLS is row-level, not
--     column-level - see the Sprint 2 migration's own note on this).
--   - An investor has NO existing way to read ANY founder_profiles or
--     profiles row for a founder they haven't started messaging - see
--     the two new policies below. Scoping them to "founder owns a
--     published startup" (rather than "founder is someone this
--     investor is messaging") is deliberate: the whole point of a
--     trust badge is to reduce time-wasting *before* either side
--     commits to a conversation, so gating it behind an existing
--     conversation would defeat most of the purpose. A publicly
--     published startup's founder being identifiable isn't a new
--     privacy exposure - the startup itself is already visible to
--     every investor.
--
-- As a side effect, these two new policies also fix a real pre-existing
-- bug: an investor's conversation list/thread currently shows the
-- literal string "Founder" instead of the founder's real name (see
-- lib/queries/messages.ts's `toConversationParticipant` fallback) -
-- `getInvestorConversations` was always trying to read `profiles` for
-- the founder, it just had nothing under RLS to find. Not something
-- this migration sets out to fix, but worth knowing about since it
-- changes visible behavior beyond just the badge.
-- ============================================================================

alter table public.founder_profiles
  add column verified boolean not null default false;

alter table public.investor_profiles
  add column verified boolean not null default false;

comment on column public.founder_profiles.verified is
  'Set only by an admin (via the service-role client from /admin/users) '
  '- never writable by the founder themselves. No RLS UPDATE policy '
  'grants this column to anyone but the admin path, same reasoning as '
  'startups.status not being directly investor-writable.';

comment on column public.investor_profiles.verified is
  'Set only by an admin (via the service-role client from /admin/users) '
  '- never writable by the investor themselves.';

-- ----------------------------------------------------------------------------
-- Guard rail: RLS is row-level, not column-level, so the existing
-- "Founders/Investors can update own [founder/investor] profile"
-- policies (auth.uid() = id, no column restriction) would otherwise
-- let a founder or investor set their OWN `verified` flag to true via
-- a direct API call, completely defeating the point of an
-- admin-controlled trust signal. Same pattern already established by
-- protect_startup_interest_update()/protect_notification_update() in
-- the Sprint 6 migration for the identical problem (a client has
-- broader UPDATE rights on a row than they should have on one specific
-- column of it): a trigger, not a second RLS policy, since Postgres
-- RLS has no per-column granularity to express this with.
--
-- The distinguishing signal is `auth.uid()`: it resolves to a real
-- user id for any request authenticated as `founder`/`investor`
-- (whether from the browser or a direct API call with their own
-- token), and to null for the service-role client `/admin/users`
-- writes through (no JWT, so no `sub` claim to read) - see
-- lib/supabase/admin.ts. This is the same distinction Supabase's own
-- docs rely on for "admin-only" server-side writes, not something
-- specific to this migration.
-- ----------------------------------------------------------------------------
create function public.protect_founder_profile_verified()
returns trigger
language plpgsql
as $$
begin
  if new.verified is distinct from old.verified and auth.uid() is not null then
    raise exception 'founder_profiles.verified can only be set by an admin';
  end if;
  return new;
end;
$$;

create trigger protect_founder_profile_verified
  before update on public.founder_profiles
  for each row
  execute function public.protect_founder_profile_verified();

create function public.protect_investor_profile_verified()
returns trigger
language plpgsql
as $$
begin
  if new.verified is distinct from old.verified and auth.uid() is not null then
    raise exception 'investor_profiles.verified can only be set by an admin';
  end if;
  return new;
end;
$$;

create trigger protect_investor_profile_verified
  before update on public.investor_profiles
  for each row
  execute function public.protect_investor_profile_verified();

-- ----------------------------------------------------------------------------
-- New read grants: investors -> founder identity, for published startups
-- ----------------------------------------------------------------------------
create policy "Investors can read founder profiles for published startups"
  on public.founder_profiles
  for select
  to authenticated
  using (
    exists (
      select 1 from public.startups s
      where s.founder_id = founder_profiles.id
        and s.status = 'published'
    )
  );

create policy "Investors can read profiles of founders with published startups"
  on public.profiles
  for select
  to authenticated
  using (
    exists (
      select 1 from public.startups s
      where s.founder_id = profiles.id
        and s.status = 'published'
    )
  );

-- ----------------------------------------------------------------------------
-- Hardening: two Sprint 7 `conversations` policies still use the same
-- inline-subquery-on-`startups` shape that caused the recursion fixed
-- in migration 20260902090000. They aren't part of an actual cycle
-- today (nothing `startups`-related reads back from `conversations`),
-- but every policy added in *this* migration reads `startups` too, and
-- the whole point of `is_own_startup()` is that new additions to this
-- part of the schema shouldn't each have to re-verify that by hand.
-- Rewriting these to call it is a no-op behavior change (identical
-- check, still just "does auth.uid() own the startup this row points
-- at") purely to keep this area of the schema on the safe pattern.
-- ----------------------------------------------------------------------------
drop policy "Founders can read conversations for own startups" on public.conversations;
create policy "Founders can read conversations for own startups"
  on public.conversations
  for select
  to authenticated
  using (public.is_own_startup(startup_id));

drop policy "Founders can mark own conversations read" on public.conversations;
create policy "Founders can mark own conversations read"
  on public.conversations
  for update
  to authenticated
  using (public.is_own_startup(startup_id))
  with check (public.is_own_startup(startup_id));
