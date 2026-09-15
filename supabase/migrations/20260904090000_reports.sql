-- ============================================================================
-- Sprint 15: Reporting & Flagging (Trust & Credibility, part 3 of 3)
-- ============================================================================
-- The last piece of the Trust & Credibility cluster - and the one the
-- app/admin dashboard has, since Sprint 9 or so, honestly admitted
-- doesn't exist yet ("No flagging or reporting mechanism exists in the
-- app yet... Adding one... is a product decision, not something this
-- page assumes on its own"). This migration is that decision.
--
-- Scope, deliberately: this ships reporting and a real admin triage
-- queue - report, reviewed, dismissed, and (reusing what already
-- exists) unpublish-the-startup or revoke-verification as the queue's
-- available actions. It does NOT ship user suspension/banning. Blocking
-- someone's ability to sign in or use the app is a meaningfully bigger,
-- security-sensitive feature on its own (there's no `suspended` concept
-- anywhere in this schema, and building one properly means touching
-- auth/session handling, not just adding a column) - bolting it onto
-- the end of a reporting migration is exactly the kind of scope creep
-- worth naming and declining rather than doing quietly. Nothing here
-- forecloses adding it later.
--
-- Every RLS policy below is a bare `auth.uid()` comparison - no
-- subquery on any other table. Deliberately: this is the third RLS
-- migration this project has needed a real fix for two circular
-- references it never intended (see 20260902090000 and this session's
-- own Sprint 13 hardening), so this one is designed from the start to
-- have nothing to be circular *with*.
-- ============================================================================

create type public.report_reason as enum (
  'spam_or_scam',
  'harassment',
  'fake_profile',
  'inappropriate_content',
  'other'
);

create type public.report_status as enum ('open', 'resolved', 'dismissed');

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reported_user_id uuid not null references public.profiles (id) on delete cascade,
  -- Both optional context, not both required - a report can be about a
  -- startup profile someone saw in Discover before ever messaging, a
  -- conversation, or just a person's profile in general.
  startup_id uuid references public.startups (id) on delete set null,
  conversation_id uuid references public.conversations (id) on delete set null,
  reason public.report_reason not null,
  details text,
  status public.report_status not null default 'open',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  -- Admin has no `profiles` row of its own (see lib/admin/auth.ts - an
  -- email allowlist, not a real account), so this is the allowlisted
  -- email itself, not a foreign key - a lightweight audit trail, not a
  -- relationship.
  reviewed_by_email text,

  constraint reports_cannot_self_report check (reporter_id != reported_user_id),
  constraint reports_details_length check (details is null or char_length(details) <= 1000)
);

comment on table public.reports is
  'Sprint 15. A founder or investor flagging another user, a startup, '
  'or a conversation for admin review - spam, harassment, a fake '
  'profile, or anything else that does not belong on the platform. '
  'Never visible to the person being reported (see the SELECT policy '
  'below) - showing someone who reported them would chill reporting '
  'and could invite retaliation.';

create index reports_status_idx on public.reports (status, created_at desc);
create index reports_reported_user_id_idx on public.reports (reported_user_id);
create index reports_reporter_id_idx on public.reports (reporter_id);

alter table public.reports enable row level security;

create policy "Users can file their own reports"
  on public.reports
  for insert
  to authenticated
  with check (reporter_id = auth.uid());

create policy "Users can read their own submitted reports"
  on public.reports
  for select
  to authenticated
  using (reporter_id = auth.uid());

-- Deliberately no policy for `reported_user_id = auth.uid()`, no
-- UPDATE policy, and no DELETE policy for anyone - a report can only
-- ever be read back by whoever filed it, and only ever change status
-- through the admin (service-role) client, same as
-- founder_profiles.verified/investor_profiles.verified in migration
-- 20260903090000.
