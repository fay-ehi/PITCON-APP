import { createAdminClient } from "@/lib/supabase/admin";
import type { InterestStatus } from "@/types/interest";
import type { UserRole } from "@/types/profile";
import type { AdminReportSummary, ReportStatus } from "@/types/report";
import type { ActivationFunnel } from "@/types/funnel";
/**
 * Server-only data fetchers backing `/admin`, added in the pre-launch
 * hardening pass. Unlike every other file in lib/queries (which read
 * through the caller's own RLS-scoped session, per that convention's
 * own docs), these deliberately use the admin client - the whole point
 * of this page is cross-user visibility an operator's own account
 * could never have under RLS. Access is gated one layer up, in
 * app/admin/layout.tsx (see lib/admin/auth.ts) - nothing in here
 * re-checks who's asking.
 */

export interface RecentSignup {
  id: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
}

/** Newest accounts first, across both roles - backs the "Recent signups" admin panel. */
export async function getRecentSignups(limit = 20): Promise<RecentSignup[]> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("profiles")
    .select("id, full_name, role, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to load recent signups: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    fullName: row.full_name,
    role: row.role,
    createdAt: row.created_at,
  }));
}

export interface RecentInterest {
  id: string;
  status: InterestStatus;
  createdAt: string;
  startupName: string | null;
  investorName: string;
}

/**
 * Newest expressed interests first, across every startup - backs the
 * "Recent interests" admin panel. Same "batch lookups instead of a deep
 * embed" shape as lib/queries/interests.ts, for the same reason (see
 * that file's own comment) - it applies just as much here even though
 * RLS itself isn't what's being worked around this time.
 */
export async function getRecentInterests(limit = 20): Promise<RecentInterest[]> {
  const admin = createAdminClient();

  const { data: interestRows, error: interestsError } = await admin
    .from("startup_interests")
    .select("id, status, created_at, startup_id, investor_id")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (interestsError) {
    throw new Error(`Failed to load recent interests: ${interestsError.message}`);
  }

  const interests = interestRows ?? [];
  if (interests.length === 0) return [];

  const startupIds = [...new Set(interests.map((i) => i.startup_id))];
  const investorIds = [...new Set(interests.map((i) => i.investor_id))];

  const [{ data: startupRows, error: startupsError }, { data: profileRows, error: profilesError }] =
    await Promise.all([
      admin.from("startups").select("id, name").in("id", startupIds),
      admin.from("profiles").select("id, full_name").in("id", investorIds),
    ]);

  if (startupsError) {
    throw new Error(`Failed to load startups for recent interests: ${startupsError.message}`);
  }
  if (profilesError) {
    throw new Error(`Failed to load investors for recent interests: ${profilesError.message}`);
  }

  const startupById = new Map((startupRows ?? []).map((row) => [row.id, row]));
  const profileById = new Map((profileRows ?? []).map((row) => [row.id, row]));

  return interests.map((row) => ({
    id: row.id,
    status: row.status,
    createdAt: row.created_at,
    startupName: startupById.get(row.startup_id)?.name ?? null,
    investorName: profileById.get(row.investor_id)?.full_name ?? "Investor",
  }));
}

export interface AdminUserSummary {
  id: string;
  fullName: string;
  role: UserRole;
  verified: boolean;
  createdAt: string;
}

/**
 * Sprint 13 (Verified Badges) - backs `/admin/users`, the admin-only
 * surface for toggling a founder's or investor's `verified` flag (see
 * migration 20260903090000 for why that flag can't be set any other
 * way). `search` matches on name only, case-insensitively - no email
 * search here since email lives on `auth.users`, not `public.profiles`,
 * and this page has never needed it (an operator reviewing verification
 * requests works from a name, not an inbox).
 */
export async function getUsersForAdmin(
  search?: string,
  limit = 50,
): Promise<AdminUserSummary[]> {
  const admin = createAdminClient();

  let query = admin
    .from("profiles")
    .select("id, full_name, role, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  const trimmedSearch = search?.trim();
  if (trimmedSearch) {
    query = query.ilike("full_name", `%${trimmedSearch}%`);
  }

  const { data: profileRows, error } = await query;
  if (error) {
    throw new Error(`Failed to load users: ${error.message}`);
  }

  const rows = profileRows ?? [];
  const founderIds = rows.filter((r) => r.role === "founder").map((r) => r.id);
  const investorIds = rows.filter((r) => r.role === "investor").map((r) => r.id);

  const [{ data: founderRows, error: founderError }, { data: investorRows, error: investorError }] =
    await Promise.all([
      founderIds.length > 0
        ? admin.from("founder_profiles").select("id, verified").in("id", founderIds)
        : Promise.resolve({ data: [] as { id: string; verified: boolean }[], error: null }),
      investorIds.length > 0
        ? admin.from("investor_profiles").select("id, verified").in("id", investorIds)
        : Promise.resolve({ data: [] as { id: string; verified: boolean }[], error: null }),
    ]);

  if (founderError) {
    throw new Error(`Failed to load founder verification status: ${founderError.message}`);
  }
  if (investorError) {
    throw new Error(`Failed to load investor verification status: ${investorError.message}`);
  }

  const verifiedById = new Map<string, boolean>();
  for (const row of founderRows ?? []) verifiedById.set(row.id, row.verified);
  for (const row of investorRows ?? []) verifiedById.set(row.id, row.verified);

  return rows.map((row) => ({
    id: row.id,
    fullName: row.full_name ?? "Unnamed",
    role: row.role,
    verified: verifiedById.get(row.id) ?? false,
    createdAt: row.created_at,
  }));
}

/**
 * Sprint 15 (Reporting & Flagging) - backs `/admin/reports`. `status`
 * filters to one column of the triage queue (open by default, from the
 * page itself) - `undefined` returns every report regardless of
 * status, for a founder/investor's own eventual dispute history if
 * that's ever needed, though the page doesn't use that yet.
 */
export async function getReportsForAdmin(
  status?: ReportStatus,
): Promise<AdminReportSummary[]> {
  const admin = createAdminClient();

  let query = admin
    .from("reports")
    .select("id, reason, details, status, created_at, reporter_id, reported_user_id, startup_id")
    .order("created_at", { ascending: false })
    .limit(100);

  if (status) {
    query = query.eq("status", status);
  }

  const { data: reportRows, error } = await query;
  if (error) {
    throw new Error(`Failed to load reports: ${error.message}`);
  }

  const rows = reportRows ?? [];
  if (rows.length === 0) return [];

  const reporterIds = rows.map((r) => r.reporter_id);
  const reportedUserIds = rows.map((r) => r.reported_user_id);
  const allProfileIds = [...new Set([...reporterIds, ...reportedUserIds])];
  const startupIds = [...new Set(rows.map((r) => r.startup_id).filter((id): id is string => id !== null))];

  const [
    { data: profileRows, error: profileError },
    { data: founderRows, error: founderError },
    { data: investorRows, error: investorError },
    { data: startupRows, error: startupError },
  ] = await Promise.all([
    admin.from("profiles").select("id, full_name, role").in("id", allProfileIds),
    admin.from("founder_profiles").select("id, verified").in("id", reportedUserIds),
    admin.from("investor_profiles").select("id, verified").in("id", reportedUserIds),
    startupIds.length > 0
      ? admin.from("startups").select("id, name, status").in("id", startupIds)
      : Promise.resolve({ data: [] as { id: string; name: string | null; status: "draft" | "published" }[], error: null }),
  ]);

  if (profileError) throw new Error(`Failed to load reports: ${profileError.message}`);
  if (founderError) throw new Error(`Failed to load reports: ${founderError.message}`);
  if (investorError) throw new Error(`Failed to load reports: ${investorError.message}`);
  if (startupError) throw new Error(`Failed to load reports: ${startupError.message}`);

  const profileById = new Map((profileRows ?? []).map((row) => [row.id, row]));
  const startupById = new Map((startupRows ?? []).map((row) => [row.id, row]));
  const verifiedById = new Map<string, boolean>();
  for (const row of founderRows ?? []) verifiedById.set(row.id, row.verified);
  for (const row of investorRows ?? []) verifiedById.set(row.id, row.verified);

  return rows.map((row) => {
    const reportedProfile = profileById.get(row.reported_user_id);
    const startup = row.startup_id ? startupById.get(row.startup_id) : undefined;

    return {
      id: row.id,
      reason: row.reason,
      details: row.details,
      status: row.status,
      createdAt: row.created_at,
      reporterName: profileById.get(row.reporter_id)?.full_name ?? "Unknown",
      reportedUserName: reportedProfile?.full_name ?? "Unknown",
      reportedUserId: row.reported_user_id,
      reportedUserRole: reportedProfile?.role ?? "founder",
      reportedUserVerified: verifiedById.get(row.reported_user_id) ?? false,
      startup: startup ? { id: startup.id, name: startup.name ?? "Untitled startup", status: startup.status } : null,
    };
  });
}

/**
 * Same 13 fields as lib/startup/completion.ts's REQUIRED_FIELDS,
 * checked directly against raw snake_case columns rather than
 * building a full `StartupFormFields` object per row just for this one
 * boolean - kept in sync by hand with that list, the same as the
 * database's own publish-completeness constraint already does per that
 * file's comment.
 */
function isReadyToPublish(row: {
  name: string | null;
  logo_url: string | null;
  tagline: string | null;
  description: string | null;
  industry_id: string | null;
  stage_id: string | null;
  country: string | null;
  city: string | null;
  funding_amount_sought: number | null;
  customer_count: number | null;
  employee_count: number | null;
  pitch_deck_path: string | null;
  elevator_pitch: string | null;
}): boolean {
  return (
    Boolean(row.name?.trim()) &&
    Boolean(row.logo_url) &&
    Boolean(row.tagline?.trim()) &&
    Boolean(row.description?.trim()) &&
    Boolean(row.industry_id) &&
    Boolean(row.stage_id) &&
    Boolean(row.country) &&
    Boolean(row.city?.trim()) &&
    row.funding_amount_sought !== null &&
    row.customer_count !== null &&
    row.employee_count !== null &&
    Boolean(row.pitch_deck_path) &&
    Boolean(row.elevator_pitch?.trim())
  );
}

/**
 * Sprint 17 (Product Analytics) - backs `/admin/funnel`. All-time
 * counts, not a rolling window or a per-cohort breakdown - a founder
 * who signed up yesterday hasn't had the same amount of time to
 * progress through the funnel as one from three months ago, which
 * this doesn't correct for. Worth building properly (cohorted by
 * signup week/month) once there's enough signup volume for cohort
 * sizes to be meaningful; before that, a cohorted view would just
 * slice an already-small user base into noise.
 *
 * "First search" (the literal wording from the roadmap conversation
 * this shipped from) isn't tracked anywhere as its own event - Discover
 * has no logged "a search was run" moment, just URL params it renders
 * against. `startup_views` (Sprint 12's Founder Analytics) is: opening
 * a startup's full preview genuinely requires having browsed/filtered
 * Discover first, so it's used here as the honest stand-in rather than
 * inventing a search-event log that doesn't exist just to match the
 * word.
 */
export async function getActivationFunnel(): Promise<ActivationFunnel> {
  const admin = createAdminClient();

  const [
    { data: profileRows, error: profileError },
    { data: startupRows, error: startupError },
    { data: investorProfileRows, error: investorProfileError },
    { data: viewRows, error: viewError },
    { data: interestRows, error: interestError },
    { data: messageRows, error: messageError },
  ] = await Promise.all([
    admin.from("profiles").select("id, role"),
    admin
      .from("startups")
      .select(
        "id, founder_id, status, name, logo_url, tagline, description, industry_id, stage_id, country, city, funding_amount_sought, customer_count, employee_count, pitch_deck_path, elevator_pitch",
      ),
    admin.from("investor_profiles").select("id, organization, investor_type, country"),
    admin.from("startup_views").select("investor_id"),
    admin.from("startup_interests").select("investor_id, startup_id"),
    admin.from("messages").select("sender_id"),
  ]);

  if (profileError) throw new Error(`Failed to load activation funnel: ${profileError.message}`);
  if (startupError) throw new Error(`Failed to load activation funnel: ${startupError.message}`);
  if (investorProfileError) throw new Error(`Failed to load activation funnel: ${investorProfileError.message}`);
  if (viewError) throw new Error(`Failed to load activation funnel: ${viewError.message}`);
  if (interestError) throw new Error(`Failed to load activation funnel: ${interestError.message}`);
  if (messageError) throw new Error(`Failed to load activation funnel: ${messageError.message}`);

  const founderIds = new Set((profileRows ?? []).filter((r) => r.role === "founder").map((r) => r.id));
  const investorIds = new Set((profileRows ?? []).filter((r) => r.role === "investor").map((r) => r.id));

  const startups = startupRows ?? [];
  const startupToFounder = new Map(startups.map((s) => [s.id, s.founder_id]));
  const startupsByFounder = new Map<string, typeof startups>();
  for (const startup of startups) {
    const list = startupsByFounder.get(startup.founder_id) ?? [];
    list.push(startup);
    startupsByFounder.set(startup.founder_id, list);
  }

  const founderProfileComplete = new Set<string>();
  const founderActivated = new Set<string>();
  for (const [founderId, founderStartups] of startupsByFounder) {
    if (founderStartups.some(isReadyToPublish)) founderProfileComplete.add(founderId);
    if (founderStartups.some((s) => s.status === "published")) founderActivated.add(founderId);
  }

  const founderReceivedInterest = new Set<string>();
  const investorExpressedInterest = new Set<string>();
  for (const row of interestRows ?? []) {
    investorExpressedInterest.add(row.investor_id);
    const founderId = startupToFounder.get(row.startup_id);
    if (founderId) founderReceivedInterest.add(founderId);
  }

  const investorActivated = new Set((viewRows ?? []).map((r) => r.investor_id));

  const investorProfileComplete = new Set(
    (investorProfileRows ?? [])
      .filter((r) => Boolean(r.organization?.trim()) && Boolean(r.investor_type) && Boolean(r.country))
      .map((r) => r.id),
  );

  const founderSentMessage = new Set<string>();
  const investorSentMessage = new Set<string>();
  for (const row of messageRows ?? []) {
    if (founderIds.has(row.sender_id)) founderSentMessage.add(row.sender_id);
    if (investorIds.has(row.sender_id)) investorSentMessage.add(row.sender_id);
  }

  return {
    founder: {
      signedUp: founderIds.size,
      profileComplete: founderProfileComplete.size,
      activated: founderActivated.size,
      firstInterest: founderReceivedInterest.size,
      firstMessage: founderSentMessage.size,
    },
    investor: {
      signedUp: investorIds.size,
      profileComplete: investorProfileComplete.size,
      activated: investorActivated.size,
      firstInterest: investorExpressedInterest.size,
      firstMessage: investorSentMessage.size,
    },
  };
}
