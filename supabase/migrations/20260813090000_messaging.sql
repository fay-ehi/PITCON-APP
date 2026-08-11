-- ============================================================================
-- Sprint 7: Messaging
-- ============================================================================
-- Turns an accepted matchmaking relationship into a private conversation.
-- Per the brief's "IMPORTANT PRODUCT MODEL", a conversation is keyed to the
-- accepted Interest - i.e. to (Investor, Startup) - never to (Investor,
-- Founder), so a founder's several startups each hold an independent
-- conversation with the same investor:
--
--   investor_profiles          startups
--        │                         │
--        └──────────┐   ┌──────────┘
--                    ▼   ▼
--             startup_interests  status = 'accepted'
--                    │
--                    ▼ (trigger, see section 5)
--              conversations   (startup_id, investor_id, startup_interest_id)
--                    │
--                    ▼ (trigger, see section 6)
--                messages       (conversation_id, sender_id, content)
--
-- Conversations are never created directly by a client (no INSERT policy
-- for either role, same "system-created" pattern as `notifications` in the
-- Sprint 6 migration) - the moment an interest is accepted, a conversation
-- for it already exists, so there's no separate "start conversation" action
-- to build, and "Prevent duplicate conversations for the same Investor +
-- Startup relationship" falls out for free from `startup_interest_id`
-- being unique (which in turn is already 1:1 with (startup_id, investor_id)
-- via `startup_interests_startup_investor_key`).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. conversations
-- ----------------------------------------------------------------------------
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.startups (id) on delete cascade,
  investor_id uuid not null references public.investor_profiles (id) on delete cascade,

  -- The accepted interest that authorized this conversation. `unique` here
  -- is the whole duplicate-prevention mechanism - see the header comment.
  startup_interest_id uuid not null unique references public.startup_interests (id) on delete cascade,

  -- Denormalized "latest activity" snapshot, kept in sync by
  -- sync_conversation_on_message() below - powers the conversation list's
  -- ordering/preview without a join or a per-row subquery over `messages`.
  last_message_at timestamptz,
  last_message_preview text,
  last_message_sender_id uuid references public.profiles (id) on delete set null,

  -- Conversation-level unread state per the brief's "MESSAGE READ STATE"
  -- ("Do not over-engineer per-message read receipts... conversation-level
  -- unread/read state is sufficient"). A plain boolean per participant
  -- rather than a `*_last_read_at` timestamp compared against
  -- `last_message_at`: PostgREST/supabase-js filters can only compare a
  -- column against a literal, not against another column of the same row,
  -- so "unread = last_message_at > my_last_read_at" isn't expressible as a
  -- single indexed filter the topbar/sidebar badge queries could use. A
  -- boolean, flipped by trigger on every new message and cleared by the
  -- client on read, is both simpler and directly queryable
  -- (`.eq('founder_unread', true)`).
  founder_unread boolean not null default false,
  investor_unread boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.conversations is
  'Sprint 7. One row per accepted (startup_id, investor_id) relationship - '
  'created automatically by create_conversation_for_accepted_interest() the '
  'moment the underlying startup_interests row becomes accepted, never '
  'directly by a client. last_message_*/*_unread are maintained by '
  'sync_conversation_on_message() and protect_conversation_update() below.';

create index conversations_startup_id_idx on public.conversations (startup_id);
create index conversations_investor_id_idx on public.conversations (investor_id);

-- ----------------------------------------------------------------------------
-- 2. messages
-- ----------------------------------------------------------------------------
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),

  -- "MESSAGE VALIDATION": reject empty/whitespace-only messages and cap a
  -- reasonable maximum length at the data layer, not only in the client
  -- form (lib/validations/message.ts mirrors these same two bounds so the
  -- form never has to rely on the database rejecting it to feel correct).
  -- A regex rather than `btrim(content) <> ''`: plain `btrim` only strips
  -- literal spaces, so a message of only newlines/tabs would slip past it
  -- - `\s` in Postgres's regex engine covers all whitespace, matching
  -- what `.trim()` already does on the client/action side.
  constraint messages_content_not_blank check (content !~ '^\s*$'),
  constraint messages_content_max_length check (char_length(content) <= 4000)
);

comment on table public.messages is
  'Sprint 7. Immutable once sent - no UPDATE/DELETE policy for anyone, no '
  'edit/redact workflow in this sprint. Every insert is authored by an '
  'authenticated participant of its conversation (see RLS below); '
  'sender_id is always auth.uid(), never client-chosen.';

-- Exactly the query pattern this table serves: "give me conversation X's
-- messages, most recent page first" (see getMessagesPage in
-- lib/queries/messages.ts) - the brief's "PERFORMANCE" section explicitly
-- calls out avoiding "loading every message ever sent in one request" /
-- needing pagination, this index is what makes that pagination cheap.
create index messages_conversation_id_created_at_idx
  on public.messages (conversation_id, created_at);

-- ----------------------------------------------------------------------------
-- 3. Backfill - conversations for interests already accepted before this
--    migration ran (Sprint 6 shipped accept/decline with no messaging
--    behind it yet). One-time; safe to re-run (ON CONFLICT DO NOTHING),
--    and superseded going forward by the trigger in section 5.
-- ----------------------------------------------------------------------------
insert into public.conversations (startup_id, investor_id, startup_interest_id)
select si.startup_id, si.investor_id, si.id
from public.startup_interests si
where si.status = 'accepted'
on conflict (startup_interest_id) do nothing;

-- ----------------------------------------------------------------------------
-- 4. Guard rails on conversations updates
-- ----------------------------------------------------------------------------
-- The only mutation either role ever performs directly on `conversations`
-- is clearing their own unread flag when they open it (see RLS policies in
-- section 5). Every other column - last_message_at/preview/sender,
-- *_unread turning true - is written by sync_conversation_on_message()
-- (section 6), which runs as an UPDATE nested one level inside the
-- `messages` AFTER INSERT trigger. pg_trigger_depth() is how this
-- function tells the two apart: a direct client UPDATE statement runs at
-- depth 1 inside this trigger; sync_conversation_on_message()'s own
-- UPDATE (issued from inside another trigger) runs at depth 2+. Only
-- depth-1 (client-originated) calls are subject to the restrictions below
-- - the nested, trigger-originated update is trusted and passed through
-- untouched.
create function public.protect_conversation_update()
returns trigger
language plpgsql
as $$
begin
  if pg_trigger_depth() > 1 then
    new.updated_at := now();
    return new;
  end if;

  if new.startup_id is distinct from old.startup_id
    or new.investor_id is distinct from old.investor_id
    or new.startup_interest_id is distinct from old.startup_interest_id
    or new.last_message_at is distinct from old.last_message_at
    or new.last_message_preview is distinct from old.last_message_preview
    or new.last_message_sender_id is distinct from old.last_message_sender_id
    or new.created_at is distinct from old.created_at then
    raise exception 'conversations: clients can only update founder_unread/investor_unread';
  end if;

  -- A client may only clear their own unread flag (mark read) - only a
  -- new message (via the trigger in section 6) can ever turn one on.
  if new.founder_unread and not old.founder_unread then
    raise exception 'conversations.founder_unread cannot be set to true by a client';
  end if;
  if new.investor_unread and not old.investor_unread then
    raise exception 'conversations.investor_unread cannot be set to true by a client';
  end if;

  -- And only the flag belonging to the acting party - an investor marking
  -- their own conversation read has no business also clearing the
  -- founder's badge, and vice versa.
  if new.investor_unread is distinct from old.investor_unread
    and auth.uid() is distinct from old.investor_id then
    raise exception 'Only the investor can update conversations.investor_unread';
  end if;
  if new.founder_unread is distinct from old.founder_unread
    and not exists (
      select 1 from public.startups s
      where s.id = old.startup_id
        and s.founder_id = auth.uid()
    ) then
    raise exception 'Only the owning founder can update conversations.founder_unread';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger protect_conversation_update
  before update on public.conversations
  for each row
  execute function public.protect_conversation_update();

-- ----------------------------------------------------------------------------
-- 5. Row Level Security - conversations
-- ----------------------------------------------------------------------------
alter table public.conversations enable row level security;

-- No INSERT/DELETE policy for either role: every row is created by
-- create_conversation_for_accepted_interest() (section 7, security
-- definer) - same reasoning as `notifications` in the Sprint 6 migration.

create policy "Investors can read own conversations"
  on public.conversations
  for select
  to authenticated
  using (investor_id = auth.uid());

create policy "Founders can read conversations for own startups"
  on public.conversations
  for select
  to authenticated
  using (
    exists (
      select 1 from public.startups s
      where s.id = startup_id
        and s.founder_id = auth.uid()
    )
  );

create policy "Investors can mark own conversations read"
  on public.conversations
  for update
  to authenticated
  using (investor_id = auth.uid())
  with check (investor_id = auth.uid());

create policy "Founders can mark own conversations read"
  on public.conversations
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
-- 6. Row Level Security - messages
-- ----------------------------------------------------------------------------
alter table public.messages enable row level security;

-- "CONVERSATION ACCESS CONTROL" / "SECURITY": a user may only read or post
-- into a conversation they're actually a participant of - re-checked here
-- via a join back to `conversations`/`startups` rather than trusted from
-- the client, same pattern as every cross-table check elsewhere in this
-- project. Not reachable at all while signed out (RLS has no `anon`
-- grant, same as every other application table).
create policy "Participants can read conversation messages"
  on public.messages
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.conversations c
      join public.startups s on s.id = c.startup_id
      where c.id = conversation_id
        and (c.investor_id = auth.uid() or s.founder_id = auth.uid())
    )
  );

create policy "Participants can send conversation messages"
  on public.messages
  for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1
      from public.conversations c
      join public.startups s on s.id = c.startup_id
      where c.id = conversation_id
        and (c.investor_id = auth.uid() or s.founder_id = auth.uid())
    )
  );

-- No UPDATE/DELETE policy for anyone - messages are immutable once sent
-- (no edit/redact workflow asked for in this sprint).

-- ----------------------------------------------------------------------------
-- 7. Interest accepted -> conversation created
-- ----------------------------------------------------------------------------
create function public.create_conversation_for_accepted_interest()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.conversations (startup_id, investor_id, startup_interest_id)
  values (new.startup_id, new.investor_id, new.id)
  on conflict (startup_interest_id) do nothing;

  return new;
end;
$$;

create trigger after_startup_interest_accepted
  after update on public.startup_interests
  for each row
  when (new.status = 'accepted' and old.status is distinct from new.status)
  execute function public.create_conversation_for_accepted_interest();

-- ----------------------------------------------------------------------------
-- 8. Message sent -> conversation snapshot synced
-- ----------------------------------------------------------------------------
create function public.sync_conversation_on_message()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_founder_id uuid;
  v_investor_id uuid;
begin
  select s.founder_id, c.investor_id
    into v_founder_id, v_investor_id
    from public.conversations c
    join public.startups s on s.id = c.startup_id
    where c.id = new.conversation_id;

  -- Whichever side didn't just send this message is the one who now has
  -- something unread; the sender's own badge for this conversation clears
  -- (they just caught up on it by definition).
  update public.conversations
  set
    last_message_at = new.created_at,
    last_message_preview = left(new.content, 140),
    last_message_sender_id = new.sender_id,
    founder_unread = (new.sender_id is distinct from v_founder_id),
    investor_unread = (new.sender_id is distinct from v_investor_id)
  where id = new.conversation_id;

  return new;
end;
$$;

create trigger after_message_insert
  after insert on public.messages
  for each row
  execute function public.sync_conversation_on_message();

-- ----------------------------------------------------------------------------
-- 9. Realtime
-- ----------------------------------------------------------------------------
-- "REAL-TIME UPDATES": an open conversation should pick up the other
-- participant's new messages without a refresh. Only `messages` is added -
-- the conversation list itself (ordering/unread badges) refreshes via the
-- normal Next.js navigation/revalidation path (see the message actions),
-- not a second realtime subscription, per the brief's "do not create an
-- overly complex real-time architecture." Supabase Realtime enforces the
-- same RLS policies as above for authenticated postgres_changes
-- subscribers, so this does not, by itself, expose any message beyond
-- what the two SELECT policies already allow.
alter publication supabase_realtime add table public.messages;
