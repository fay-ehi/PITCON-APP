-- ============================================================================
-- Sprint 12: Startup Analytics, Investor Shortlist & Richer Startup Profiles
-- ============================================================================
-- Three additions, all additive to the existing schema (no existing
-- column, table, or policy is altered or dropped):
--
--   1. Six new optional `startups` columns - enough for an investor to
--      gauge financial shape/traction beyond the Sprint 3 four-number
--      set, and a pitch video link. None of these join the Sprint 3
--      `startups_publish_requires_completeness` constraint - matching
--      that constraint's own precedent (annual/monthly revenue, cover
--      image, socials are all optional-for-publish), a founder who
--      never fills these in can still publish.
--
--   2. `startup_views` - one row per (startup, investor, day) an
--      investor opens a startup's full Discover preview. Backs Founder
--      Analytics: total views, unique-investor count, a views-over-time
--      trend, and a "recently viewed by" list.
--
--   3. `startup_shortlists` - one row per (investor, startup) an
--      investor bookmarks from Discover. Unlike `startup_interests`,
--      this is freely toggleable (has a DELETE policy) - shortlisting is
--      a low-commitment "keep an eye on this" action, not a
--      relationship with the founder, so there's no equivalent of
--      "duplicate interest protection" beyond the plain unique pair.
--
-- Both new tables mirror the Sprint 6 `startup_interests` migration's
-- shape (insert re-checks `status = 'published'`, select is
-- ownership-scoped, ids can never be reassigned by an update - though
-- neither of these tables is ever updated in place, only inserted/
-- deleted) rather than inventing a new RLS pattern for the same kind of
-- "investor <-> startup" relationship.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Richer startup profile columns
-- ----------------------------------------------------------------------------
alter table public.startups
  add column funding_raised_to_date bigint,
  add column valuation bigint,
  add column monthly_burn_rate bigint,
  add column runway_months integer,
  add column traction_highlights text,
  add column pitch_video_url text;

comment on column public.startups.funding_raised_to_date is
  'Total raised across all prior rounds, in USD. Optional, never required '
  'for publish - see startups_publish_requires_completeness (Sprint 3), '
  'unchanged by this migration.';

comment on column public.startups.traction_highlights is
  'Free-text milestones/metrics an investor should know beyond the plain '
  'numbers (e.g. "Grew MoM revenue 20% for 6 straight months; signed '
  'first enterprise customer in Q2") - deliberately unstructured, same '
  'reasoning as elevator_pitch, rather than a rigid milestones table.';

comment on column public.startups.pitch_video_url is
  'A link to an externally-hosted pitch video (YouTube/Vimeo/Loom/etc) - '
  'PITCON does not host video itself. Rendered as a plain external link '
  'next to the pitch deck, not an embedded player, to avoid taking a '
  'dependency on any one video host''s embed behavior.';

alter table public.startups
  add constraint startups_funding_raised_to_date_nonnegative
    check (funding_raised_to_date is null or funding_raised_to_date >= 0),
  add constraint startups_valuation_nonnegative
    check (valuation is null or valuation >= 0),
  add constraint startups_monthly_burn_rate_nonnegative
    check (monthly_burn_rate is null or monthly_burn_rate >= 0),
  add constraint startups_runway_months_nonnegative
    check (runway_months is null or runway_months >= 0),
  add constraint startups_traction_highlights_length
    check (traction_highlights is null or char_length(traction_highlights) <= 500),
  add constraint startups_pitch_video_url_length
    check (pitch_video_url is null or char_length(pitch_video_url) <= 2048);

-- ----------------------------------------------------------------------------
-- 2. startup_views (Founder Analytics)
-- ----------------------------------------------------------------------------
-- Grain is (startup, investor, day) rather than one row per open, via
-- the unique constraint below - repeatedly reopening the same startup's
-- preview in one sitting (or one day) shouldn't inflate "total views"
-- or the daily trend. `viewed_on` is a plain date (not derived from
-- created_at at query time) so the uniqueness constraint and the
-- views-by-day grouping both read directly off an indexed column.
create table public.startup_views (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.startups (id) on delete cascade,
  investor_id uuid not null references public.investor_profiles (id) on delete cascade,
  viewed_on date not null default current_date,
  created_at timestamptz not null default now(),

  constraint startup_views_startup_investor_day_key unique (startup_id, investor_id, viewed_on)
);

comment on table public.startup_views is
  'Sprint 12 (Founder Analytics). One row per (startup, investor, day) an '
  'investor opens the full Discover preview for a published startup - '
  'logged best-effort from app/investor/discover/page.tsx, never blocking '
  'the investor''s own page load. Deliberately no UPDATE/DELETE policy for '
  'anyone: a view is an immutable log entry, same reasoning as '
  'notifications never being deletable by a client.';

create index startup_views_startup_id_idx on public.startup_views (startup_id);
create index startup_views_investor_id_idx on public.startup_views (investor_id);
-- Backs both "views in the last 14 days" grouping and "most recent
-- distinct viewers" for one startup - see getStartupAnalytics.
create index startup_views_startup_viewed_on_idx
  on public.startup_views (startup_id, viewed_on desc);

alter table public.startup_views enable row level security;

create policy "Investors can log their own startup views"
  on public.startup_views
  for insert
  to authenticated
  with check (
    investor_id = auth.uid()
    and exists (
      select 1 from public.startups s
      where s.id = startup_id
        and s.status = 'published'
    )
  );

create policy "Investors can read their own view history"
  on public.startup_views
  for select
  to authenticated
  using (investor_id = auth.uid());

create policy "Founders can read views of their own startups"
  on public.startup_views
  for select
  to authenticated
  using (
    exists (
      select 1 from public.startups s
      where s.id = startup_id
        and s.founder_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 3. startup_shortlists (Investor Shortlist)
-- ----------------------------------------------------------------------------
create table public.startup_shortlists (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid not null references public.investor_profiles (id) on delete cascade,
  startup_id uuid not null references public.startups (id) on delete cascade,
  created_at timestamptz not null default now(),

  constraint startup_shortlists_investor_startup_key unique (investor_id, startup_id)
);

comment on table public.startup_shortlists is
  'Sprint 12 (Investor Shortlist). An investor bookmarking a published '
  'startup from Discover to revisit later - a lower-commitment action '
  'than startup_interests, so unlike that table this one has a DELETE '
  'policy: an investor can freely un-shortlist. Never visible to '
  'founders - deliberately not surfaced as a "who shortlisted you" '
  'signal in this pass, see startup_views for the analogous view-based '
  'signal that IS surfaced to founders.';

create index startup_shortlists_investor_id_idx
  on public.startup_shortlists (investor_id, created_at desc);
create index startup_shortlists_startup_id_idx on public.startup_shortlists (startup_id);

alter table public.startup_shortlists enable row level security;

create policy "Investors can shortlist published startups"
  on public.startup_shortlists
  for insert
  to authenticated
  with check (
    investor_id = auth.uid()
    and exists (
      select 1 from public.startups s
      where s.id = startup_id
        and s.status = 'published'
    )
  );

create policy "Investors can read their own shortlist"
  on public.startup_shortlists
  for select
  to authenticated
  using (investor_id = auth.uid());

create policy "Investors can remove their own shortlist entries"
  on public.startup_shortlists
  for delete
  to authenticated
  using (investor_id = auth.uid());

-- Mirrors the Sprint 6 "Investors can read startups they've expressed
-- interest in" policy: a shortlisted startup should keep showing up on
-- the investor's own My Shortlist page even if the founder later
-- unpublishes it, rather than the page silently losing a row.
create policy "Investors can read startups they've shortlisted"
  on public.startups
  for select
  to authenticated
  using (
    exists (
      select 1 from public.startup_shortlists ss
      where ss.startup_id = startups.id
        and ss.investor_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 4. Scoped cross-user profile reads for viewed-by analytics
-- ----------------------------------------------------------------------------
-- Same shape as the Sprint 6 migration's "Founders can read profiles of
-- investors interested in their startups" - additive, narrowly scoped:
-- a founder can read an investor's profile through this policy only
-- once that investor has actually viewed one of the founder's own
-- published startups. Without this, getStartupAnalytics's "recently
-- viewed by" list could only ever show an investor id, never a name.
create policy "Founders can read profiles of investors who viewed their startups"
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

create policy "Founders can read investor profiles for viewers of their startups"
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
