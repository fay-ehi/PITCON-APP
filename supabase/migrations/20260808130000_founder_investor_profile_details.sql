-- ============================================================================
-- Sprint 2: Founder & Investor Profiles
-- ============================================================================
-- Fleshes out the `founder_profiles` / `investor_profiles` shells created in
-- Sprint 1 with the real professional-identity columns, adds the two
-- centralized taxonomy tables (`industries`, `startup_stages`) called for by
-- the PITCON planning docs, the normalized investor preference join tables
-- built on top of them, and the `avatars` Storage bucket.
--
--   auth.users
--        │
--        ▼
--   profiles                     (+ avatar_url)
--        │
--        ├── founder_profiles    (+ job_title, country, bio, website_url)
--        │
--        └── investor_profiles   (+ organization, investor_type, country,
--                                   bio, linkedin_url, funding range)
--                 │
--                 ├── investor_industry_preferences ──> industries
--                 └── investor_stage_preferences    ──> startup_stages
--
-- No changes to Sprint 1's RLS policies on profiles/founder_profiles/
-- investor_profiles are needed: those policies are row-level ("own row
-- only"), so they automatically cover the new columns added here too.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. investor_type enum
-- ----------------------------------------------------------------------------
-- Mirrors the PRD's investor taxonomy ("Angel investor, VC, accelerator,
-- syndicate, or corporate investor"). An enum here for the same reason
-- Sprint 1 used one for `user_role`: an invalid type can't be stored, and
-- codegen produces a real union instead of `string`. Keep in sync with
-- constants/investor-types.ts.
create type public.investor_type as enum (
  'angel',
  'vc',
  'accelerator',
  'syndicate',
  'corporate'
);

-- ----------------------------------------------------------------------------
-- 2. Centralized taxonomy: industries / startup_stages
-- ----------------------------------------------------------------------------
-- Per the Sprint 2 brief: investor industry/stage preferences must reference
-- a centralized structure rather than storing arbitrary strings, and the
-- same structure gets reused by Startup Discovery filtering once Sprint 3
-- (startups) and Sprint 5 (discovery) exist. Plain reference tables (not an
-- enum) so the list can be extended later without a migration that rewrites
-- a Postgres enum type.
create table public.industries (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.industries is
  'Centralized industry taxonomy. Referenced by investor industry '
  'preferences now, and by startups.industry_id from Sprint 3 onward. '
  'Reference data managed via migration, not user-writable.';

create table public.startup_stages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.startup_stages is
  'Centralized startup-stage taxonomy (Pre-Seed, Seed, Series A, ...). '
  'Referenced by investor stage preferences now, and by startups.stage_id '
  'from Sprint 3 onward. Reference data managed via migration, not '
  'user-writable.';

alter table public.industries enable row level security;
alter table public.startup_stages enable row level security;

-- Reference data: readable by anyone (including signed-out visitors, since
-- these render in public-facing selects/filters eventually), never
-- writable from the client.
create policy "Industries are readable by everyone"
  on public.industries
  for select
  to public
  using (true);

create policy "Startup stages are readable by everyone"
  on public.startup_stages
  for select
  to public
  using (true);

insert into public.industries (slug, name, sort_order) values
  ('fintech', 'FinTech', 10),
  ('healthtech', 'HealthTech', 20),
  ('agritech', 'Agriculture', 30),
  ('edtech', 'Education', 40),
  ('ecommerce', 'E-commerce & Retail', 50),
  ('logistics', 'Logistics & Supply Chain', 60),
  ('energy', 'Energy & CleanTech', 70),
  ('proptech', 'Real Estate', 80),
  ('mobility', 'Transportation & Mobility', 90),
  ('insurtech', 'InsurTech', 100),
  ('media', 'Media & Entertainment', 110),
  ('manufacturing', 'Manufacturing & Industrial', 120),
  ('telecom', 'Telecommunications', 130),
  ('consumer', 'Consumer Goods', 140),
  ('traveltech', 'Travel & Hospitality', 150),
  ('govtech', 'GovTech & Civic Tech', 160),
  ('other', 'Other', 999);

insert into public.startup_stages (slug, name, sort_order) values
  ('idea', 'Idea Stage', 10),
  ('pre-seed', 'Pre-Seed', 20),
  ('seed', 'Seed', 30),
  ('series-a', 'Series A', 40),
  ('series-b', 'Series B', 50),
  ('series-c-plus', 'Series C+', 60),
  ('growth', 'Growth / Late Stage', 70);

-- ----------------------------------------------------------------------------
-- 3. profiles: shared avatar
-- ----------------------------------------------------------------------------
-- Lives on the shared `profiles` table rather than being duplicated onto
-- both founder_profiles and investor_profiles, same rationale as
-- `full_name` in Sprint 1.
alter table public.profiles
  add column avatar_url text;

alter table public.profiles
  add constraint profiles_avatar_url_length
  check (avatar_url is null or char_length(avatar_url) <= 2048);

-- ----------------------------------------------------------------------------
-- 4. founder_profiles: professional identity columns
-- ----------------------------------------------------------------------------
alter table public.founder_profiles
  add column job_title text,
  add column country text,
  add column bio text,
  add column website_url text;

comment on column public.founder_profiles.website_url is
  'A single flexible link per the Sprint 2 brief: LinkedIn, a personal '
  'landing page, or a portfolio URL. Format validated at the application '
  'layer (Zod); only a sane length ceiling is enforced here.';

alter table public.founder_profiles
  add constraint founder_profiles_job_title_length
    check (job_title is null or char_length(trim(job_title)) between 2 and 100),
  add constraint founder_profiles_country_length
    check (country is null or char_length(trim(country)) between 2 and 100),
  add constraint founder_profiles_bio_length
    check (bio is null or char_length(bio) <= 500),
  add constraint founder_profiles_website_url_length
    check (website_url is null or char_length(website_url) <= 2048);

-- ----------------------------------------------------------------------------
-- 5. investor_profiles: professional identity + funding range
-- ----------------------------------------------------------------------------
alter table public.investor_profiles
  add column organization text,
  add column investor_type public.investor_type,
  add column country text,
  add column bio text,
  add column linkedin_url text,
  add column funding_range_min bigint,
  add column funding_range_max bigint;

comment on column public.investor_profiles.funding_range_min is
  'Typical minimum cheque size in USD. Stored info only for this sprint '
  '- not used for matching/filtering yet (Discover ships in Sprint 5).';
comment on column public.investor_profiles.funding_range_max is
  'Typical maximum cheque size in USD. See funding_range_min.';

alter table public.investor_profiles
  add constraint investor_profiles_organization_length
    check (organization is null or char_length(trim(organization)) between 2 and 150),
  add constraint investor_profiles_country_length
    check (country is null or char_length(trim(country)) between 2 and 100),
  add constraint investor_profiles_bio_length
    check (bio is null or char_length(bio) <= 500),
  add constraint investor_profiles_linkedin_url_length
    check (linkedin_url is null or char_length(linkedin_url) <= 2048),
  add constraint investor_profiles_funding_range_min_nonnegative
    check (funding_range_min is null or funding_range_min >= 0),
  add constraint investor_profiles_funding_range_max_nonnegative
    check (funding_range_max is null or funding_range_max >= 0),
  add constraint investor_profiles_funding_range_order
    check (
      funding_range_min is null
      or funding_range_max is null
      or funding_range_max >= funding_range_min
    );

-- ----------------------------------------------------------------------------
-- 6. Investor preference join tables
-- ----------------------------------------------------------------------------
-- Normalized many-to-many relationships (an investor may prefer several
-- industries and several stages) rather than a comma-separated string
-- column, per the Sprint 2 brief. Composite primary keys double as the
-- uniqueness constraint (an investor can't prefer the same industry twice)
-- and as a natural index for "does investor X already have industry Y"
-- lookups.
create table public.investor_industry_preferences (
  investor_id uuid not null references public.investor_profiles (id) on delete cascade,
  industry_id uuid not null references public.industries (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (investor_id, industry_id)
);

create table public.investor_stage_preferences (
  investor_id uuid not null references public.investor_profiles (id) on delete cascade,
  stage_id uuid not null references public.startup_stages (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (investor_id, stage_id)
);

-- Reverse-direction indexes: the primary key above already makes
-- "preferences for investor X" fast; these make "which investors prefer
-- industry/stage Y" fast too, which Discovery (Sprint 5) will need.
create index investor_industry_preferences_industry_idx
  on public.investor_industry_preferences (industry_id);

create index investor_stage_preferences_stage_idx
  on public.investor_stage_preferences (stage_id);

alter table public.investor_industry_preferences enable row level security;
alter table public.investor_stage_preferences enable row level security;

-- Ownership follows the same pattern as founder_profiles/investor_profiles
-- in Sprint 1: investor_id IS the investor's auth.uid(), since it's a
-- foreign key straight to investor_profiles.id. No UPDATE policy on
-- either table - preferences are toggled via delete+insert (see
-- replace_investor_preferences() below), never edited in place.
create policy "Investors can view own industry preferences"
  on public.investor_industry_preferences
  for select
  to authenticated
  using (auth.uid() = investor_id);

create policy "Investors can add own industry preferences"
  on public.investor_industry_preferences
  for insert
  to authenticated
  with check (auth.uid() = investor_id);

create policy "Investors can remove own industry preferences"
  on public.investor_industry_preferences
  for delete
  to authenticated
  using (auth.uid() = investor_id);

create policy "Investors can view own stage preferences"
  on public.investor_stage_preferences
  for select
  to authenticated
  using (auth.uid() = investor_id);

create policy "Investors can add own stage preferences"
  on public.investor_stage_preferences
  for insert
  to authenticated
  with check (auth.uid() = investor_id);

create policy "Investors can remove own stage preferences"
  on public.investor_stage_preferences
  for delete
  to authenticated
  using (auth.uid() = investor_id);

-- ----------------------------------------------------------------------------
-- 7. replace_investor_preferences() RPC
-- ----------------------------------------------------------------------------
-- Swaps an investor's entire industry/stage preference set atomically
-- (Postgres functions execute inside a single transaction), so the client
-- never has to do a manual delete-then-insert as two separate round trips
-- with a window of inconsistency between them.
--
-- Deliberately NOT `security definer`: it runs as the calling user, so the
-- RLS policies above still apply exactly as if the client had issued the
-- delete/insert statements directly. auth.uid() is read server-side from
-- the caller's JWT, never trusted from an argument, so this can't be used
-- to touch another investor's preferences.
create function public.replace_investor_preferences(
  p_industry_ids uuid[],
  p_stage_ids uuid[]
)
returns void
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_investor_id uuid := auth.uid();
begin
  if v_investor_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Clearer error than a bare foreign-key violation if a founder (or an
  -- investor whose row somehow doesn't exist yet) calls this.
  if not exists (
    select 1 from public.investor_profiles where id = v_investor_id
  ) then
    raise exception 'No investor profile found for the current user';
  end if;

  delete from public.investor_industry_preferences
    where investor_id = v_investor_id;
  delete from public.investor_stage_preferences
    where investor_id = v_investor_id;

  if p_industry_ids is not null and array_length(p_industry_ids, 1) > 0 then
    insert into public.investor_industry_preferences (investor_id, industry_id)
    select v_investor_id, industry_id
    from unnest(p_industry_ids) as industry_id;
  end if;

  if p_stage_ids is not null and array_length(p_stage_ids, 1) > 0 then
    insert into public.investor_stage_preferences (investor_id, stage_id)
    select v_investor_id, stage_id
    from unnest(p_stage_ids) as stage_id;
  end if;
end;
$$;

comment on function public.replace_investor_preferences is
  'Atomically replaces the calling investor''s industry and stage '
  'preferences. security invoker (the default) - RLS on the underlying '
  'tables is what actually enforces ownership, this function is just a '
  'transactional convenience wrapper around delete+insert.';

revoke all on function public.replace_investor_preferences(uuid[], uuid[]) from public;
grant execute on function public.replace_investor_preferences(uuid[], uuid[]) to authenticated;

-- ----------------------------------------------------------------------------
-- 8. Storage: avatars bucket
-- ----------------------------------------------------------------------------
-- Public bucket: avatars need to be viewable wherever a founder/investor's
-- identity later appears (startup pages, investor interest, messaging),
-- none of which exist yet, but there's no reason an avatar specifically
-- needs to be gated the way a pitch deck might be. Kept in sync with
-- lib/profile/avatar-constraints.ts (5MB, png/jpeg/webp).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

-- Objects are stored as `{user_id}/{filename}`, so `(storage.foldername(name))[1]`
-- (the first path segment) is the owner's uid. This is the standard
-- Supabase Storage RLS pattern for "users can only touch their own
-- folder" and is what actually enforces "a user can only modify their own
-- avatar" - the client never gets to claim a different user_id, because
-- the object path is checked against auth.uid() from the JWT, not
-- anything the client sends.
create policy "Avatar images are publicly readable"
  on storage.objects
  for select
  to public
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own avatar"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own avatar"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
