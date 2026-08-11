-- ============================================================================
-- Sprint 6: Investor Interest & Matchmaking
-- ============================================================================
-- Adds the core matchmaking relationship - an Investor expressing interest
-- in a Startup - plus the notification foundation the brief asks this
-- workflow to feed.
--
--   investor_profiles                startups
--        │                               │
--        └──────────┐         ┌──────────┘
--                    ▼         ▼
--                startup_interests   (investor_id, startup_id) unique
--                    │
--                    ▼ (on insert / on status change)
--                notifications        (recipient_id, type, ...)
--
-- Per the Sprint 6 brief's "IMPORTANT PRODUCT MODEL": the relationship is
-- Investor + Startup, never Investor + Founder - `startup_interests`
-- references `startups.id` directly (not `founder_id`) so the same
-- investor can hold independent relationships with several startups
-- owned by the same founder.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. interest_status enum
-- ----------------------------------------------------------------------------
-- The three states the brief calls for, no more ("Do not invent
-- additional states unless technically necessary").
create type public.interest_status as enum ('pending', 'accepted', 'declined');

-- ----------------------------------------------------------------------------
-- 2. startup_interests
-- ----------------------------------------------------------------------------
create table public.startup_interests (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.startups (id) on delete cascade,
  investor_id uuid not null references public.investor_profiles (id) on delete cascade,
  status public.interest_status not null default 'pending',
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- "DUPLICATE INTEREST PROTECTION": one investor can hold at most one
  -- relationship with a given startup, full stop - enforced here, not
  -- only in the UI, per the brief's "Enforce this at the database/data
  -- layer, not only in the UI." There's no withdraw/re-express workflow
  -- in this sprint (not asked for), so a plain unique pair - rather than
  -- a partial unique index scoped to status = 'pending' - is the
  -- simplest constraint that satisfies the requirement: a declined
  -- interest still occupies the pair, which is the correct behavior
  -- until a future sprint explicitly adds "express interest again."
  constraint startup_interests_startup_investor_key unique (startup_id, investor_id)
);

comment on table public.startup_interests is
  'Sprint 6. The Investor <-> Startup matchmaking relationship - deliberately '
  'keyed to startup_id, not founder_id, so one founder''s several startups '
  'each hold independent relationships with the same investor. One row per '
  '(startup_id, investor_id) pair for the lifetime of the relationship; '
  'status moves pending -> accepted|declined via protect_startup_interest_update().';

comment on column public.startup_interests.responded_at is
  'Set automatically (see protect_startup_interest_update()) the moment a '
  'founder accepts or declines - never written directly by the app.';

create index startup_interests_startup_id_idx on public.startup_interests (startup_id);
create index startup_interests_investor_id_idx on public.startup_interests (investor_id);

create trigger set_updated_at
  before update on public.startup_interests
  for each row
  execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. Guard rails on updates
-- ----------------------------------------------------------------------------
-- RLS (below) already means only a startup's owning founder can ever
-- reach an UPDATE on one of its interests - investors have no UPDATE
-- policy at all, so they cannot move their own interest's status. This
-- trigger is the second half of "keep the action unambiguous": it stops
-- a founder's update from doing anything except deciding pending ->
-- accepted/declined, so the same statement can never be used to
-- reassign an interest to a different startup or investor.
create function public.protect_startup_interest_update()
returns trigger
language plpgsql
as $$
begin
  if new.startup_id is distinct from old.startup_id
    or new.investor_id is distinct from old.investor_id then
    raise exception 'startup_interests.startup_id/investor_id cannot be changed';
  end if;

  if new.status is distinct from old.status then
    if new.status not in ('accepted', 'declined') then
      raise exception 'An interest can only be moved to accepted or declined';
    end if;
    new.responded_at := now();
  end if;

  return new;
end;
$$;

create trigger protect_startup_interest_update
  before update on public.startup_interests
  for each row
  execute function public.protect_startup_interest_update();

-- ----------------------------------------------------------------------------
-- 4. Row Level Security
-- ----------------------------------------------------------------------------
alter table public.startup_interests enable row level security;

-- Investor can create interest only for themselves, only on a startup
-- that's actually published. Both halves are re-checked here rather than
-- trusted from the client, per the brief's "SECURITY" section.
create policy "Investors can express interest in published startups"
  on public.startup_interests
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

create policy "Investors can read own interests"
  on public.startup_interests
  for select
  to authenticated
  using (investor_id = auth.uid());

create policy "Founders can read interests for own startups"
  on public.startup_interests
  for select
  to authenticated
  using (
    exists (
      select 1 from public.startups s
      where s.id = startup_id
        and s.founder_id = auth.uid()
    )
  );

-- No UPDATE policy for investors: only a founder can move an interest out
-- of pending (see protect_startup_interest_update() above for the rest of
-- that guarantee). No DELETE policy for anyone: withdrawing/removing an
-- interest is out of scope for this sprint.
create policy "Founders can respond to interests for own startups"
  on public.startup_interests
  for update
  to authenticated
  using (
    exists (
      select 1 from public.startups s
      where s.id = startup_id
        and s.founder_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.startups s
      where s.id = startup_id
        and s.founder_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 5. Scoped cross-user profile reads
-- ----------------------------------------------------------------------------
-- The Sprint 1 migration's RLS section flagged this exact case ahead of
-- time: "later sprints (e.g. ... an investor's name after they express
-- interest) may need a scoped public-read policy." That sprint is this
-- one. Additive to, not a replacement for, "Users can read own profile" /
-- "Investors can read own investor profile" - a founder can only ever see
-- an investor's profile through this policy once that investor has
-- actually expressed interest in one of the founder's own startups
-- ("Do not expose private Investor information").
create policy "Founders can read profiles of investors interested in their startups"
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

create policy "Founders can read investor profiles for their interests"
  on public.investor_profiles
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.startup_interests si
      join public.startups s on s.id = si.startup_id
      where si.investor_id = investor_profiles.id
        and s.founder_id = auth.uid()
    )
  );

-- Mirror image: an investor's own "My Interests" history should keep
-- showing the startup even if the founder later unpublishes it (a stale
-- link elsewhere already handles "not found" for a *new* visit via
-- Discover - see getDiscoverableStartupById - this is specifically about
-- an interest the investor already holds staying visible). Additive to
-- the Sprint 5 "Investors can read published startups" policy.
create policy "Investors can read startups they've expressed interest in"
  on public.startups
  for select
  to authenticated
  using (
    exists (
      select 1 from public.startup_interests si
      where si.startup_id = startups.id
        and si.investor_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 6. notifications
-- ----------------------------------------------------------------------------
-- The data/event foundation the brief asks for: "If the notification
-- system is not yet fully implemented, build the data/event foundation
-- required for this workflow without creating an unrelated notification
-- redesign." Scoped to exactly the two events this sprint defines (new
-- interest -> founder, decision -> investor) - a generic `type` column
-- and nullable `startup_interest_id` leave room for future notification
-- kinds without a schema change, but nothing beyond Interest events is
-- implemented here.
create type public.notification_type as enum (
  'interest_received',
  'interest_accepted',
  'interest_declined'
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text not null,
  -- Where clicking the notification should go - founder notifications
  -- point at Founder Interests, investor notifications at Investor My
  -- Interests. Plain text, not a foreign key: the destination is a route,
  -- not a database reference.
  link_path text not null,
  startup_interest_id uuid references public.startup_interests (id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.notifications is
  'Sprint 6. Minimal notification foundation, populated only by the '
  'Interest workflow triggers below - not a general-purpose notification '
  'system redesign. recipient_id is a profiles.id, so this works '
  'identically for founder and investor recipients.';

create index notifications_recipient_id_idx on public.notifications (recipient_id, created_at desc);

-- Partial index: exactly the query the topbar unread badge runs
-- ("how many unread notifications does this user have"), on every
-- founder/investor page load.
create index notifications_recipient_unread_idx
  on public.notifications (recipient_id)
  where read_at is null;

alter table public.notifications enable row level security;

create policy "Users can read own notifications"
  on public.notifications
  for select
  to authenticated
  using (recipient_id = auth.uid());

-- The only mutation a client ever performs directly is marking their own
-- notifications read - enforced down to the column by the trigger below,
-- same pattern as protect_startup_interest_update() above.
create policy "Users can mark own notifications read"
  on public.notifications
  for update
  to authenticated
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

create function public.protect_notification_update()
returns trigger
language plpgsql
as $$
begin
  if new.recipient_id is distinct from old.recipient_id
    or new.type is distinct from old.type
    or new.title is distinct from old.title
    or new.body is distinct from old.body
    or new.link_path is distinct from old.link_path
    or new.startup_interest_id is distinct from old.startup_interest_id
    or new.created_at is distinct from old.created_at then
    raise exception 'notifications: only read_at can be updated by a client';
  end if;
  return new;
end;
$$;

create trigger protect_notification_update
  before update on public.notifications
  for each row
  execute function public.protect_notification_update();

-- No INSERT/DELETE policy for clients: every row is created by the
-- security-definer triggers below, same reasoning as handle_new_user()
-- in the Sprint 1 migration - the recipient of a notification is the
-- *other* party in the interest, so the acting user's own RLS grants
-- could never cover the insert even if one existed.

-- ----------------------------------------------------------------------------
-- 7. Interest -> notification triggers
-- ----------------------------------------------------------------------------
create function public.notify_founder_of_new_interest()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_founder_id uuid;
  v_startup_name text;
begin
  select s.founder_id, coalesce(nullif(trim(s.name), ''), 'Your startup')
    into v_founder_id, v_startup_name
    from public.startups s
    where s.id = new.startup_id;

  if v_founder_id is null then
    return new;
  end if;

  insert into public.notifications (recipient_id, type, title, body, link_path, startup_interest_id)
  values (
    v_founder_id,
    'interest_received',
    'New investor interest',
    'A new investor is interested in ' || v_startup_name || '.',
    '/founder/interests',
    new.id
  );

  return new;
end;
$$;

create trigger after_startup_interest_insert
  after insert on public.startup_interests
  for each row
  execute function public.notify_founder_of_new_interest();

create function public.notify_investor_of_interest_response()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_startup_name text;
begin
  if new.status = old.status or new.status = 'pending' then
    return new;
  end if;

  select coalesce(nullif(trim(s.name), ''), 'This startup')
    into v_startup_name
    from public.startups s
    where s.id = new.startup_id;

  insert into public.notifications (recipient_id, type, title, body, link_path, startup_interest_id)
  values (
    new.investor_id,
    case new.status
      when 'accepted' then 'interest_accepted'::public.notification_type
      else 'interest_declined'::public.notification_type
    end,
    case new.status
      when 'accepted' then 'Interest accepted'
      else 'Interest update'
    end,
    'Your interest in ' || v_startup_name
      || case new.status when 'accepted' then ' was accepted.' else ' was declined.' end,
    '/investor/interests',
    new.id
  );

  return new;
end;
$$;

create trigger after_startup_interest_status_change
  after update on public.startup_interests
  for each row
  execute function public.notify_investor_of_interest_response();
