import { createAdminClient } from "@/lib/supabase/admin";
import type { InterestStatus } from "@/types/interest";
import type { UserRole } from "@/types/profile";

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
