-- ============================================================================
-- Sprint 3: Startup Creation & Management
-- ============================================================================
-- Adds the `startups` table - the business entity a Founder builds and
-- Investors will eventually discover - plus the Storage buckets for its
-- logo, cover image, and pitch deck.
--
--   founder_profiles
--        │ 1:1 (founder_id is unique)
--        ▼
--   startups              (draft -> published)
--        ├── industry_id  -> industries       (Sprint 2 taxonomy, reused)
--        └── stage_id     -> startup_stages   (Sprint 2 taxonomy, reused)
--
-- Per the Sprint 3 brief: one founder has at most one startup for the
-- MVP (no team members, no co-founders, no ownership transfer). That's
-- enforced with a plain `unique` constraint on `founder_id` rather than
-- making `founder_id` the primary key - a surrogate `id` primary key
-- keeps the door open for the future-phase "multiple founders" relation
-- to reference startups.id without a schema change, whereas a
-- founder_id-as-PK design would have to be unwound later.
--
-- Founder profile vs startup: deliberately no founder bio/job
-- title/personal country columns here - those live on founder_profiles
-- (Sprint 2). This table is business information only, per the Sprint 3
-- brief's "Founder profile = the person, Startup profile = the
-- business" distinction.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. startup_status enum
-- ----------------------------------------------------------------------------
create type public.startup_status as enum ('draft', 'published');

-- ----------------------------------------------------------------------------
-- 2. startups
-- ----------------------------------------------------------------------------
create table public.startups (
  id uuid primary key default gen_random_uuid(),
  founder_id uuid not null unique references public.founder_profiles (id) on delete cascade,
  status public.startup_status not null default 'draft',

  -- Basic information
  name text,
  logo_url text,
  cover_image_url text,
  tagline text,
  description text,

  -- Company information
  industry_id uuid references public.industries (id),
  stage_id uuid references public.startup_stages (id),
  country text,
  city text,
  website_url text,

  -- Funding
  funding_amount_sought bigint,

  -- Traction (per the Sprint 3 brief: "enough structured information to
  -- understand the startup", not an elaborate financial reporting
  -- system - four plain numbers, matching the planning document's
  -- "Create Startup" field list).
  annual_revenue bigint,
  monthly_revenue bigint,
  customer_count integer,
  employee_count integer,

  -- Pitch
  -- pitch_deck_path is a Storage *object path* ("{founder_id}/{file}"),
  -- not a public URL - the `pitch-decks` bucket is private (see below),
  -- so a signed URL is generated on demand server-side whenever the
  -- founder views/downloads their own deck.
  pitch_deck_path text,
  pitch_deck_original_name text,
  elevator_pitch text,

  -- Socials (all optional, per the planning document)
  linkedin_url text,
  twitter_url text,
  instagram_url text,

  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.startups is
  'The business entity a Founder builds. One row per founder (founder_id '
  'is unique) for the MVP - no team members, no co-founders. Starts as '
  'draft; becomes published (and eligible for a future Investor '
  'Discovery sprint) only once it passes startups_publish_requires_completeness below.';

comment on column public.startups.pitch_deck_path is
  'Storage object path in the private `pitch-decks` bucket, not a public '
  'URL. Access rule (public / investor-only / after-interest) is an '
  'explicit product decision the planning document defers to a later '
  'sprint - until that sprint exists, only the owning founder can read '
  'it (see the storage policies below), via a signed URL generated on '
  'demand.';

-- ----------------------------------------------------------------------------
-- 3. Field-length / non-negativity constraints
-- ----------------------------------------------------------------------------
-- Same pattern as founder_profiles/investor_profiles in the Sprint 2
-- migration: a sane length ceiling here, format/requiredness validated
-- at the application layer (Zod).
alter table public.startups
  add constraint startups_name_length
    check (name is null or char_length(trim(name)) between 2 and 100),
  add constraint startups_tagline_length
    check (tagline is null or char_length(trim(tagline)) between 2 and 150),
  add constraint startups_description_length
    check (description is null or char_length(description) <= 2000),
  add constraint startups_elevator_pitch_length
    check (elevator_pitch is null or char_length(elevator_pitch) <= 600),
  add constraint startups_country_length
    check (country is null or char_length(trim(country)) between 2 and 100),
  add constraint startups_city_length
    check (city is null or char_length(trim(city)) between 2 and 100),
  add constraint startups_website_url_length
    check (website_url is null or char_length(website_url) <= 2048),
  add constraint startups_linkedin_url_length
    check (linkedin_url is null or char_length(linkedin_url) <= 2048),
  add constraint startups_twitter_url_length
    check (twitter_url is null or char_length(twitter_url) <= 2048),
  add constraint startups_instagram_url_length
    check (instagram_url is null or char_length(instagram_url) <= 2048),
  add constraint startups_logo_url_length
    check (logo_url is null or char_length(logo_url) <= 2048),
  add constraint startups_cover_image_url_length
    check (cover_image_url is null or char_length(cover_image_url) <= 2048),
  add constraint startups_pitch_deck_path_length
    check (pitch_deck_path is null or char_length(pitch_deck_path) <= 2048),
  add constraint startups_funding_amount_sought_nonnegative
    check (funding_amount_sought is null or funding_amount_sought >= 0),
  add constraint startups_annual_revenue_nonnegative
    check (annual_revenue is null or annual_revenue >= 0),
  add constraint startups_monthly_revenue_nonnegative
    check (monthly_revenue is null or monthly_revenue >= 0),
  add constraint startups_customer_count_nonnegative
    check (customer_count is null or customer_count >= 0),
  add constraint startups_employee_count_nonnegative
    check (employee_count is null or employee_count >= 0);

-- ----------------------------------------------------------------------------
-- 4. Publish-completeness constraint (server-side, database-enforced)
-- ----------------------------------------------------------------------------
-- Per the Sprint 3 brief: "Publishing must be validated server-side. Do
-- not rely only on frontend form validation. A founder should not be
-- able to bypass required fields by manually calling an endpoint." The
-- server action layer (lib/startup/startup-actions.ts) checks this
-- before ever attempting the update and returns a friendly per-field
-- error - but *this* constraint is the actual backstop: no row can be
-- in status = 'published' without every field the planning document's
-- "Create Startup" spec marks as required (i.e. every field it does NOT
-- explicitly tag "(optional)"). It also means an edit that would strip
-- a required field from an already-published startup is rejected by the
-- database rather than silently downgrading the startup back to draft,
-- per the brief: "edits should not accidentally change its status back
-- to draft."
--
-- Deliberately NOT required for publish (matches the planning doc's
-- explicit "(optional)" tags / "Optional:" section): website, annual
-- revenue, monthly revenue, cover image, and all three social links.
alter table public.startups
  add constraint startups_publish_requires_completeness
  check (
    status = 'draft'
    or (
      name is not null
      and logo_url is not null
      and tagline is not null
      and description is not null
      and industry_id is not null
      and stage_id is not null
      and country is not null
      and city is not null
      and funding_amount_sought is not null
      and customer_count is not null
      and employee_count is not null
      and pitch_deck_path is not null
      and elevator_pitch is not null
    )
  );

-- ----------------------------------------------------------------------------
-- 5. Indexes
-- ----------------------------------------------------------------------------
-- founder_id already has a unique index from the constraint above ("does
-- this founder already have a startup" is fast). status/industry_id/
-- stage_id are for the future Investor Discovery sprint's filtering -
-- harmless to add now, not used by anything in this sprint.
create index startups_status_idx on public.startups (status);
create index startups_industry_id_idx on public.startups (industry_id);
create index startups_stage_id_idx on public.startups (stage_id);

-- ----------------------------------------------------------------------------
-- 6. updated_at maintenance
-- ----------------------------------------------------------------------------
create trigger set_updated_at
  before update on public.startups
  for each row
  execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 7. Row Level Security
-- ----------------------------------------------------------------------------
-- Deliberately narrow, matching the Sprint 3 brief: "Do not create broad
-- public access simply to make development easier." A published
-- startup's eventual visibility to investors is an Investor Discovery
-- decision (a later sprint) - for now, only the owning founder can read
-- or write their own startup, full stop, regardless of status.
alter table public.startups enable row level security;

create policy "Founders can read own startup"
  on public.startups
  for select
  to authenticated
  using (auth.uid() = founder_id);

create policy "Founders can create own startup"
  on public.startups
  for insert
  to authenticated
  with check (auth.uid() = founder_id);

create policy "Founders can update own startup"
  on public.startups
  for update
  to authenticated
  using (auth.uid() = founder_id)
  with check (auth.uid() = founder_id);

create policy "Founders can delete own startup"
  on public.startups
  for delete
  to authenticated
  using (auth.uid() = founder_id);

-- ----------------------------------------------------------------------------
-- 8. Storage: startup-logos / startup-covers (public) and pitch-decks
--    (private)
-- ----------------------------------------------------------------------------
-- Logos and cover images are public for the same reason avatars are
-- (Sprint 2 migration): once a startup is published they need to be
-- viewable wherever it appears, and there's no reason a logo/cover
-- specifically needs gating. Kept in sync with
-- lib/startup/asset-constraints.ts.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'startup-logos',
  'startup-logos',
  true,
  5242880, -- 5MB
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'startup-covers',
  'startup-covers',
  true,
  8388608, -- 8MB
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

-- Pitch decks are NOT public. Per the Sprint 3 brief: "If the planning
-- document does not definitively establish the access rule, implement
-- the storage/reference foundation but do not make the deck broadly
-- public" - the Technical Architecture doc explicitly defers this
-- decision ("Pitch decks require stricter permissions... that is a
-- product decision we still need to make"). Until Investor Discovery
-- defines that rule, access is owner-only; founders view/download their
-- own deck via a short-lived signed URL generated server-side.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pitch-decks',
  'pitch-decks',
  false,
  20971520, -- 20MB
  array['application/pdf']
)
on conflict (id) do nothing;

-- Objects stored as `{founder_id}/{filename}`, same ownership pattern as
-- the `avatars` bucket in Sprint 2: `(storage.foldername(name))[1]` is
-- checked against auth.uid() from the JWT, never anything the client
-- sends, so a founder can't manipulate another founder's files simply
-- by changing a storage path.
create policy "Startup logos are publicly readable"
  on storage.objects
  for select
  to public
  using (bucket_id = 'startup-logos');

create policy "Founders can upload their own startup logo"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'startup-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Founders can update their own startup logo"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'startup-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'startup-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Founders can delete their own startup logo"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'startup-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Startup cover images are publicly readable"
  on storage.objects
  for select
  to public
  using (bucket_id = 'startup-covers');

create policy "Founders can upload their own startup cover image"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'startup-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Founders can update their own startup cover image"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'startup-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'startup-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Founders can delete their own startup cover image"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'startup-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- No public/investor select policy on pitch-decks: only the owning
-- founder can read their own file. Every access goes through a signed
-- URL request that itself requires this SELECT policy to succeed.
create policy "Founders can read their own pitch deck"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'pitch-decks'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Founders can upload their own pitch deck"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'pitch-decks'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Founders can update their own pitch deck"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'pitch-decks'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'pitch-decks'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Founders can delete their own pitch deck"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'pitch-decks'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
