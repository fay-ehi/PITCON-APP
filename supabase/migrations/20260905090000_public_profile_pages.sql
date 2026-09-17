-- ============================================================================
-- Sprint 18: Public Profile Pages
-- ============================================================================
-- Founders and Investors can now open each other's full profile - from an
-- avatar in Messages, from My Interests, or from an admin verification
-- review - via `getFounderProfileDetail(userId)` / `getInvestorProfileDetail
-- (userId)` (lib/queries/profile.ts), the same functions the self-view
-- profile pages already used, just now called with someone else's id.
--
-- Every cross-user column those two functions read was already granted by
-- an earlier sprint's RLS (Sprint 6's "Founders can read investor profiles
-- for their interests", Sprint 13's "Investors can read founder profiles
-- for published startups") - RLS is row-level, not column-level, so a new
-- page reading an already-readable row needs no new policy, same reasoning
-- as the Sprint 13 migration's own note on `verified`.
--
-- The one real gap: `getInvestorProfileDetail` also resolves the investor's
-- industry/stage preference chips via `getInvestorPreferenceIds`, which
-- reads `investor_industry_preferences` / `investor_stage_preferences` -
-- two tables that, per the Sprint 2 migration, have only ever granted
-- "investor reads own preferences" (`auth.uid() = investor_id`). A founder
-- opening an investor's profile page today would silently see empty
-- "Industries"/"Startup stages" sections regardless of what that investor
-- actually selected - not a crash, just quietly wrong. This migration
-- closes that gap the same way Sprint 6 closed the equivalent one for
-- `profiles`/`investor_profiles`: a second, additive SELECT policy scoped
-- to "this investor has expressed interest in one of my startups", exact
-- same `startup_interests` join `investor_profiles`'s own Sprint 6 policy
-- already uses.
-- ============================================================================

create policy "Founders can read industry preferences of interested investors"
  on public.investor_industry_preferences
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.startup_interests si
      join public.startups s on s.id = si.startup_id
      where si.investor_id = investor_industry_preferences.investor_id
        and s.founder_id = auth.uid()
    )
  );

create policy "Founders can read stage preferences of interested investors"
  on public.investor_stage_preferences
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.startup_interests si
      join public.startups s on s.id = si.startup_id
      where si.investor_id = investor_stage_preferences.investor_id
        and s.founder_id = auth.uid()
    )
  );
