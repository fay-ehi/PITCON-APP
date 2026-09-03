-- ============================================================================
-- Sprint 10: First-Time User Onboarding / Product Tour
-- ============================================================================
-- Persists whether a user has finished (or skipped) the first-time product
-- tour overlay, so it shows exactly once per account rather than once per
-- browser.
--
-- Deliberately a new, separate column rather than reusing anything named
-- "onboarding": `/founder/onboarding` and `/investor/onboarding` (Sprint 2)
-- are a distinct, already-shipped concept - first-run *profile setup*
-- (job title, bio, investment preferences, ...). Naming this column
-- `onboarding_completed` would collide with that existing vocabulary and
-- make it read as if finishing profile setup also finishes the product
-- tour (or vice versa). They're independent: a user can skip the profile
-- setup form and still see the tour, or finish profile setup and still be
-- new to the tour.
--
-- Lives on `profiles` rather than a new table - it's a single boolean
-- owned 1:1 by the account, exactly like the rest of that table, and every
-- place that needs it (`app/founder/startups/page.tsx`,
-- `app/investor/discover/page.tsx`) already loads the full profile row via
-- `getCurrentUserProfile()`. No new query, no new RLS policy needed: the
-- existing "Users can update own profile" policy from the Sprint 1
-- migration already covers updating this column on your own row.
-- ============================================================================

alter table public.profiles
  add column product_tour_completed boolean not null default false;

comment on column public.profiles.product_tour_completed is
  'Whether this account has finished or skipped the first-time product '
  'tour overlay (Sprint 10). Sourced from the authenticated profile row, '
  'never a client-supplied role/flag, and persists across devices - see '
  'lib/onboarding/tour-actions.ts.';
