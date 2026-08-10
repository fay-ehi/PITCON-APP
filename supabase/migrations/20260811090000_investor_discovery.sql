-- ============================================================================
-- Sprint 5: Investor Discovery
-- ============================================================================
-- Grants Investors read access to *published* startups, and adds the
-- indexes Discover's search/filter/sort actually query against.
--
-- Nothing about the startups write path changes here: Founders still
-- only ever read/write their own rows (Sprint 3/4 policies, untouched).
-- This migration only ADDS a second, narrower SELECT policy - Postgres
-- combines multiple permissive RLS policies with OR, so a Founder's own
-- access is unaffected and an Investor's access is purely additive.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Investors can read published startups
-- ----------------------------------------------------------------------------
-- Scoped two ways, per the Sprint 5 brief's "SECURITY" section ("do not
-- expose... draft startups... enforce this server-side and through
-- RLS... do not rely only on client-side filtering"):
--
--   - status = 'published'        draft/incomplete startups never leak
--                                  through this policy, regardless of
--                                  who's asking.
--   - profiles.role = 'investor'  a signed-in Founder's own session
--                                  can't read *other* founders' published
--                                  startups through this policy either -
--                                  defense in depth alongside the
--                                  app.founder/investor layout redirects,
--                                  matching the brief's explicit "Founder
--                                  cannot access Investor Discovery" test.
--
-- The `exists` subquery reads the caller's own `profiles` row, which the
-- Sprint 1 "Users can read own profile" policy (auth.uid() = id) already
-- permits, so this never needs to bypass RLS itself.
create policy "Investors can read published startups"
  on public.startups
  for select
  to authenticated
  using (
    status = 'published'
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'investor'
    )
  );

comment on policy "Investors can read published startups" on public.startups is
  'Sprint 5 (Investor Discovery). Additive to, not a replacement for, the '
  'Sprint 3 founder-only policies above - a founder can still only read '
  'their own rows via those; this is what lets an investor read anyone''s '
  'published startup.';

-- ----------------------------------------------------------------------------
-- 2. Indexes for Discover's filters/search/sort
-- ----------------------------------------------------------------------------
-- status/industry_id/stage_id already have indexes from the Sprint 3
-- migration - harmless there, load-bearing now that Discover actually
-- filters by them. Country and funding amount are new filters this
-- sprint introduces, and every Discover query sorts by published_at.
create index if not exists startups_country_idx
  on public.startups (country);

create index if not exists startups_funding_amount_sought_idx
  on public.startups (funding_amount_sought);

create index if not exists startups_published_at_idx
  on public.startups (published_at desc);
