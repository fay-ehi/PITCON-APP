import { createClient } from "@/lib/supabase/server";
import type {
  FounderProfileDetail,
  IndustryOption,
  InvestorProfileDetail,
  StageOption,
} from "@/types/profile";

/**
 * Server-only data fetchers for Sprint 2 (Founder & Investor Profiles).
 * Every function here creates its own Supabase server client and reads
 * through the caller's session, so RLS ("own row only", "reference data
 * is public") is what actually enforces access - these are convenience
 * wrappers, not a separate authorization layer. Only call these from
 * Server Components or Server Actions.
 */

export async function getIndustries(): Promise<IndustryOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("industries")
    .select("id, name, slug")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getStartupStages(): Promise<StageOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("startup_stages")
    .select("id, name, slug")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** The signed-in founder's combined `profiles` + `founder_profiles` row,
 * or `null` if either is missing (shouldn't happen for a real founder
 * account, but Server Components should never assume). */
export async function getFounderProfileDetail(
  userId: string,
): Promise<FounderProfileDetail | null> {
  const supabase = await createClient();

  const [
    { data: profile, error: profileError },
    { data: founder, error: founderError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", userId)
      .single(),
    supabase
      .from("founder_profiles")
      .select("job_title, country, bio, website_url")
      .eq("id", userId)
      .single(),
  ]);

  if (profileError || founderError || !profile || !founder) return null;

  return {
    fullName: profile.full_name,
    avatarUrl: profile.avatar_url,
    jobTitle: founder.job_title,
    country: founder.country,
    bio: founder.bio,
    websiteUrl: founder.website_url,
  };
}

/** Just the selected industry/stage preference IDs for the signed-in
 * investor - used by the edit/onboarding form to know which chips start
 * selected. Kept separate from `getInvestorProfileDetail` (which resolves
 * full name/slug for display) to avoid a fragile embedded-relation
 * select; the two lookup tables are small enough that the edit form
 * already has the full options list loaded via `getIndustries()` /
 * `getStartupStages()` to cross-reference against. */
export async function getInvestorPreferenceIds(userId: string): Promise<{
  industryIds: string[];
  stageIds: string[];
}> {
  const supabase = await createClient();

  const [
    { data: industryRows, error: industryError },
    { data: stageRows, error: stageError },
  ] = await Promise.all([
    supabase
      .from("investor_industry_preferences")
      .select("industry_id")
      .eq("investor_id", userId),
    supabase
      .from("investor_stage_preferences")
      .select("stage_id")
      .eq("investor_id", userId),
  ]);

  if (industryError) throw industryError;
  if (stageError) throw stageError;

  return {
    industryIds: (industryRows ?? []).map((row) => row.industry_id),
    stageIds: (stageRows ?? []).map((row) => row.stage_id),
  };
}

/** The signed-in investor's combined `profiles` + `investor_profiles`
 * row, plus their preferences resolved to full `{ id, name, slug }`
 * options (for display on the profile view page). */
export async function getInvestorProfileDetail(
  userId: string,
): Promise<InvestorProfileDetail | null> {
  const supabase = await createClient();

  const [
    { data: profile, error: profileError },
    { data: investor, error: investorError },
    { industryIds, stageIds },
    allIndustries,
    allStages,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", userId)
      .single(),
    supabase
      .from("investor_profiles")
      .select(
        "organization, investor_type, country, bio, linkedin_url, funding_range_min, funding_range_max",
      )
      .eq("id", userId)
      .single(),
    getInvestorPreferenceIds(userId),
    getIndustries(),
    getStartupStages(),
  ]);

  if (profileError || investorError || !profile || !investor) return null;

  const industryIdSet = new Set(industryIds);
  const stageIdSet = new Set(stageIds);

  return {
    fullName: profile.full_name,
    avatarUrl: profile.avatar_url,
    organization: investor.organization,
    investorType: investor.investor_type,
    country: investor.country,
    bio: investor.bio,
    linkedinUrl: investor.linkedin_url,
    fundingRangeMin: investor.funding_range_min,
    fundingRangeMax: investor.funding_range_max,
    industries: allIndustries.filter((industry) =>
      industryIdSet.has(industry.id),
    ),
    stages: allStages.filter((stage) => stageIdSet.has(stage.id)),
  };
}
