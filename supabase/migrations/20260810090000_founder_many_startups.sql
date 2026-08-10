-- ============================================================================
-- Sprint 4: Founder Workspace / Dashboard — architecture update
-- ============================================================================
-- The Sprint 3 migration (20260809080000_startups.sql) enforced "one
-- founder has at most one startup" with `founder_id uuid not null unique`.
-- The product has changed: a Founder now owns *many* Startups.
--
--   founder_profiles
--        │ 1:many
--        ▼
--   startups   (unchanged columns/constraints otherwise - still
--                draft -> published, still gated by
--                startups_publish_requires_completeness)
--
-- Nothing about an individual startup row changes here - only the
-- cardinality of founder_id -> startups. RLS is untouched: every policy
-- already scoped by `auth.uid() = founder_id` per-row, which was never
-- dependent on the uniqueness constraint, so "a founder can only see/
-- edit/delete their own startups" holds exactly as before, just now for
-- N rows instead of at most 1.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Drop the one-startup-per-founder constraint
-- ----------------------------------------------------------------------------
-- Postgres auto-named this `startups_founder_id_key` for the inline
-- `unique` on the Sprint 3 `create table`. Dropping it also drops the
-- unique index backing it, so a plain (non-unique) index is added right
-- after so "startups for this founder" lookups (My Startups, every
-- ownership-scoped query in lib/queries/startup.ts) stay indexed.
alter table public.startups
  drop constraint if exists startups_founder_id_key;

create index if not exists startups_founder_id_idx
  on public.startups (founder_id);

comment on table public.startups is
  'The business entities a Founder builds - many rows per founder as of '
  'Sprint 4 (see 20260810090000_founder_many_startups.sql; Sprint 3 '
  'originally capped this at one). Each starts as draft; becomes '
  'published (and eligible for a future Investor Discovery sprint) only '
  'once it passes startups_publish_requires_completeness below.';

-- ----------------------------------------------------------------------------
-- 2. Everything else - unchanged, restated for clarity
-- ----------------------------------------------------------------------------
-- Not touched by this migration, listed here so it's clear what was
-- deliberately left alone:
--   - startups_publish_requires_completeness (still per-row)
--   - all field-length / non-negativity checks (still per-row)
--   - status/industry_id/stage_id indexes (still per-row, unaffected by
--     founder_id's cardinality)
--   - RLS policies (already per-row `founder_id = auth.uid()`)
--   - storage buckets/policies for startup-logos / startup-covers /
--     pitch-decks - the app layer now writes objects to
--     `{founder_id}/{startup_id}/{filename}` instead of
--     `{founder_id}/{filename}` (see lib/startup/asset-actions.ts and
--     lib/startup/pitch-deck-actions.ts) so two startups belonging to the
--     same founder never collide in the same bucket. The storage RLS
--     policies only ever checked the first path segment
--     (`(storage.foldername(name))[1] = auth.uid()::text`), so this is a
--     pure application-layer change - no policy update needed here.



# stop the dev server first

npm run dev