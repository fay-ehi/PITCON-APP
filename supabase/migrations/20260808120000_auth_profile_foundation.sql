-- ============================================================================
-- Sprint 1: Authentication & Account Foundation
-- ============================================================================
-- Establishes the application-level user record (`profiles`) that sits on
-- top of Supabase's own `auth.users`, plus the minimal role-specific
-- extension tables (`founder_profiles` / `investor_profiles`) that later
-- sprints will flesh out.
--
--   auth.users          (Supabase-managed authentication)
--        │ 1:1
--        ▼
--   profiles            (application-level identity + role)
--        │
--        ├── founder_profiles   (only when role = 'founder')
--        │
--        └── investor_profiles  (only when role = 'investor')
--
-- Role is fixed at signup (chosen client-side, validated here) and cannot
-- be changed by the user afterwards: role switching is explicitly out of
-- scope for the MVP. See `prevent_profile_role_change()` below.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Role enum
-- ----------------------------------------------------------------------------
-- An enum (rather than a free-text column) means an invalid role can't be
-- stored even by mistake, and `supabase gen types` produces a proper
-- `"founder" | "investor"` union instead of `string`.
create type public.user_role as enum ('founder', 'investor');

-- ----------------------------------------------------------------------------
-- 2. profiles
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) > 0),
  role public.user_role not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Application-level user record, 1:1 with auth.users. Created automatically '
  'by handle_new_user() when someone signs up, never inserted directly '
  'from the client.';

create index profiles_role_idx on public.profiles (role);

alter table public.profiles enable row level security;

-- ----------------------------------------------------------------------------
-- 3. founder_profiles / investor_profiles (minimal shells for Sprint 1)
-- ----------------------------------------------------------------------------
-- Sprint 2 adds the real columns (bio, organization, investment
-- preferences, etc). For now these exist purely to prove the
-- profiles -> role-specific-table relationship and to give every
-- founder/investor a row to extend later. The primary key doubling as the
-- foreign key enforces the 1:1 relationship.
create table public.founder_profiles (
  id uuid primary key references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.founder_profiles is
  'Founder-specific profile data. One row per founder, created '
  'automatically alongside `profiles`. Sprint 2 adds real columns '
  '(job title, country, bio, etc).';

create table public.investor_profiles (
  id uuid primary key references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.investor_profiles is
  'Investor-specific profile data. One row per investor, created '
  'automatically alongside `profiles`. Sprint 2 adds real columns '
  '(organization, investor type, investment preferences, etc).';

alter table public.founder_profiles enable row level security;
alter table public.investor_profiles enable row level security;

-- ----------------------------------------------------------------------------
-- 4. updated_at maintenance
-- ----------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

create trigger set_updated_at
  before update on public.founder_profiles
  for each row
  execute function public.set_updated_at();

create trigger set_updated_at
  before update on public.investor_profiles
  for each row
  execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 5. Role immutability
-- ----------------------------------------------------------------------------
-- Role switching is explicitly not part of the MVP. RLS lets a user update
-- their own profile row (e.g. full_name later), but nothing should let
-- them change `role` through that same update. Enforced here rather than
-- relying on the client never sending the field.
create function public.prevent_profile_role_change()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role then
    raise exception 'profiles.role cannot be changed after signup';
  end if;
  return new;
end;
$$;

create trigger prevent_role_change
  before update on public.profiles
  for each row
  execute function public.prevent_profile_role_change();

-- ----------------------------------------------------------------------------
-- 6. Auto-provisioning on signup
-- ----------------------------------------------------------------------------
-- The signup form (Sprint 1) collects full name + role and passes them as
-- `raw_user_meta_data` (`full_name`, `role`) to `supabase.auth.signUp()`.
-- This trigger reads that metadata and creates the matching `profiles` row
-- plus the corresponding role-specific shell row, atomically with account
-- creation.
--
-- `security definer` is required because this fires as part of inserting
-- into `auth.users`, before the new user has any of their own RLS
-- permissions. `search_path` is pinned to prevent search-path hijacking,
-- the standard hardening for security-definer functions.
--
-- If `role` is missing or not one of 'founder'/'investor', account
-- creation itself fails (the whole transaction is rolled back). The
-- signup form always sends a validated role, so this should never fire in
-- normal use: it exists as a database-level backstop against ambiguous
-- or automatic role assignment, per the product requirement that role
-- must always be explicit.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  submitted_role text := new.raw_user_meta_data ->> 'role';
  submitted_name text := trim(coalesce(new.raw_user_meta_data ->> 'full_name', ''));
begin
  if submitted_role is null or submitted_role not in ('founder', 'investor') then
    raise exception 'Cannot create profile: missing or invalid role in signup metadata';
  end if;

  if submitted_name = '' then
    raise exception 'Cannot create profile: missing full name in signup metadata';
  end if;

  insert into public.profiles (id, full_name, role)
  values (new.id, submitted_name, submitted_role::public.user_role);

  if submitted_role = 'founder' then
    insert into public.founder_profiles (id) values (new.id);
  else
    insert into public.investor_profiles (id) values (new.id);
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 7. Row Level Security
-- ----------------------------------------------------------------------------
-- Deliberately narrow for Sprint 1: a user can only read/update their own
-- rows. There is no public-read policy yet: later sprints (e.g. showing a
-- founder's name on a published startup, or an investor's name after they
-- express interest) may need a scoped public-read policy, but that's a
-- product decision for when that feature actually exists, not something
-- to pre-guess here.
--
-- No INSERT policy on any of these tables: rows are only ever created by
-- `handle_new_user()` (security definer, bypasses RLS). Clients can never
-- insert a profile directly. No DELETE policy either: account deletion
-- is out of scope for this sprint.

create policy "Users can read own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Founders can read own founder profile"
  on public.founder_profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Founders can update own founder profile"
  on public.founder_profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Investors can read own investor profile"
  on public.investor_profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Investors can update own investor profile"
  on public.investor_profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
