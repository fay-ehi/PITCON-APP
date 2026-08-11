import { createClient } from "@/lib/supabase/server";
import { getIndustries, getStartupStages } from "@/lib/queries/profile";
import type {
  FounderInterestSummary,
  InterestStartupSummary,
  InterestStatus,
  InvestorInterestSummary,
} from "@/types/interest";

/**
 * Server-only data fetchers for Sprint 6 (Investor Interest &
 * Matchmaking). Same convention as the rest of lib/queries: every
 * function reads through the caller's own Supabase session, so RLS (see
 * the Sprint 6 migration) is what actually enforces "an investor only
 * ever sees their own interests" / "a founder only ever sees interests
 * for their own startups" - the `investorId`/`founderId` parameters here
 * shape the query, they aren't the access check.
 *
 * Both fetchers do their own small batch of `.in(...)` lookups rather
 * than a single deep PostgREST embed (startup_interests -> startups /
 * investor_profiles -> profiles), matching how `getDiscoverableStartups`
 * resolves industry/stage separately rather than embedding - it keeps
 * each query simple and predictable under RLS, and stays comfortably
 * within "avoid N+1 queries" since it's a fixed number of round trips
 * regardless of how many interests come back.
 */

function toStartupSummary(
  row: { id: string; name: string | null; logo_url: string | null; industry_id: string | null; stage_id: string | null },
  industries: Awaited<ReturnType<typeof getIndustries>>,
  stages: Awaited<ReturnType<typeof getStartupStages>>,
): InterestStartupSummary {
  return {
    id: row.id,
    name: row.name,
    logoUrl: row.logo_url,
    industry: industries.find((i) => i.id === row.industry_id)?.name ?? null,
    stage: stages.find((s) => s.id === row.stage_id)?.name ?? null,
  };
}

/**
 * Every interest the signed-in investor has submitted, newest first -
 * backs `/investor/interests`. An empty array is the normal "haven't
 * expressed interest in anything yet" case, not an error.
 */
export async function getInvestorInterests(
  investorId: string,
): Promise<InvestorInterestSummary[]> {
  const supabase = await createClient();

  const [{ data: interestRows, error: interestsError }, industries, stages] = await Promise.all([
    supabase
      .from("startup_interests")
      .select("*")
      .eq("investor_id", investorId)
      .order("created_at", { ascending: false }),
    getIndustries(),
    getStartupStages(),
  ]);

  if (interestsError) {
    throw new Error(`Failed to load interests: ${interestsError.message}`);
  }

  const interests = interestRows ?? [];
  if (interests.length === 0) return [];

  const startupIds = [...new Set(interests.map((i) => i.startup_id))];
  const { data: startupRows, error: startupsError } = await supabase
    .from("startups")
    .select("id, name, logo_url, industry_id, stage_id")
    .in("id", startupIds);

  if (startupsError) {
    throw new Error(`Failed to load startups: ${startupsError.message}`);
  }

  const startupById = new Map((startupRows ?? []).map((row) => [row.id, row]));

  return interests.map((row) => {
    const startupRow = startupById.get(row.startup_id);
    return {
      id: row.id,
      status: row.status,
      createdAt: row.created_at,
      respondedAt: row.responded_at,
      startup: startupRow
        ? toStartupSummary(startupRow, industries, stages)
        : { id: row.startup_id, name: null, logoUrl: null, industry: null, stage: null },
    };
  });
}

/**
 * Every interest submitted for any startup the signed-in founder owns,
 * newest first - backs `/founder/interests`. Resolves each interest's
 * startup (name/logo, so the founder can tell which startup it's about -
 * see the brief's "MULTIPLE STARTUPS" section) and the interested
 * investor's approved-for-display profile fields in two batched lookups.
 * An empty array covers both "no startups yet" and "no interest yet" -
 * the caller renders the same empty state either way.
 */
export async function getFounderInterests(
  founderId: string,
): Promise<FounderInterestSummary[]> {
  const supabase = await createClient();

  const [{ data: ownStartups, error: startupsError }, industries, stages] = await Promise.all([
    supabase
      .from("startups")
      .select("id, name, logo_url, industry_id, stage_id")
      .eq("founder_id", founderId),
    getIndustries(),
    getStartupStages(),
  ]);

  if (startupsError) {
    throw new Error(`Failed to load startups: ${startupsError.message}`);
  }

  const startups = ownStartups ?? [];
  if (startups.length === 0) return [];

  const startupById = new Map(startups.map((row) => [row.id, row]));

  const { data: interestRows, error: interestsError } = await supabase
    .from("startup_interests")
    .select("*")
    .in("startup_id", startups.map((s) => s.id))
    .order("created_at", { ascending: false });

  if (interestsError) {
    throw new Error(`Failed to load interests: ${interestsError.message}`);
  }

  const interests = interestRows ?? [];
  if (interests.length === 0) return [];

  const investorIds = [...new Set(interests.map((i) => i.investor_id))];
  const [{ data: investorProfileRows, error: investorProfileError }, { data: profileRows, error: profileError }] =
    await Promise.all([
      supabase
        .from("investor_profiles")
        .select("id, organization, investor_type, country, bio, linkedin_url")
        .in("id", investorIds),
      supabase.from("profiles").select("id, full_name, avatar_url").in("id", investorIds),
    ]);

  if (investorProfileError) {
    throw new Error(`Failed to load investor profiles: ${investorProfileError.message}`);
  }
  if (profileError) {
    throw new Error(`Failed to load investor profiles: ${profileError.message}`);
  }

  const investorProfileById = new Map((investorProfileRows ?? []).map((row) => [row.id, row]));
  const profileById = new Map((profileRows ?? []).map((row) => [row.id, row]));

  return interests.map((row) => {
    const startupRow = startupById.get(row.startup_id);
    const investorProfile = investorProfileById.get(row.investor_id);
    const profile = profileById.get(row.investor_id);

    return {
      id: row.id,
      status: row.status,
      createdAt: row.created_at,
      respondedAt: row.responded_at,
      startup: startupRow
        ? toStartupSummary(startupRow, industries, stages)
        : { id: row.startup_id, name: null, logoUrl: null, industry: null, stage: null },
      investor: {
        id: row.investor_id,
        // Falls back rather than failing the whole list on a single
        // missing profile - shouldn't happen (RLS + the FK guarantee a
        // matching row), but a defensive placeholder is cheaper than a
        // thrown error for one stale-looking row.
        fullName: profile?.full_name ?? "Investor",
        avatarUrl: profile?.avatar_url ?? null,
        organization: investorProfile?.organization ?? null,
        investorType: investorProfile?.investor_type ?? null,
        country: investorProfile?.country ?? null,
        bio: investorProfile?.bio ?? null,
        linkedinUrl: investorProfile?.linkedin_url ?? null,
      },
    };
  });
}

/**
 * Whether the signed-in investor already has an interest (in any status)
 * for one specific startup - backs the Discover preview panel's "Express
 * Interest" / "Interest Sent" toggle so a page load already knows which
 * state to render, without a separate client-side check.
 */
export async function getOwnInterestForStartup(
  investorId: string,
  startupId: string,
): Promise<{ id: string; status: InterestStatus } | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("startup_interests")
    .select("id, status")
    .eq("investor_id", investorId)
    .eq("startup_id", startupId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load interest status: ${error.message}`);
  }

  return data;
}
