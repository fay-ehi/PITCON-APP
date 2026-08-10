import { createClient } from "@/lib/supabase/server";
import { getIndustries, getStartupStages } from "@/lib/queries/profile";
import type { StartupDetail, StartupRow } from "@/types/startup";

/** PostgREST's code for ".single() got 0 or >1 rows" - see the matching
 * comment in lib/queries/profile.ts. A founder simply not owning the
 * startup id being requested (deleted, or never theirs) is the expected
 * "not found" path here, not a bug signal - but it's still kept distinct
 * from other errors so a real query failure doesn't get silently treated
 * the same way. */
const PGRST_NO_ROWS = "PGRST116";

/** Exported for reuse by lib/queries/discover.ts (Sprint 5) - Discover
 * reads the same `startups` row shape for published startups, just
 * through a different RLS-scoped query, so it maps rows to
 * `StartupDetail` the same way rather than duplicating this logic. */
export function rowToDetail(
  row: StartupRow,
  industries: Awaited<ReturnType<typeof getIndustries>>,
  stages: Awaited<ReturnType<typeof getStartupStages>>,
): StartupDetail {
  return {
    id: row.id,
    status: row.status,
    name: row.name,
    logoUrl: row.logo_url,
    coverImageUrl: row.cover_image_url,
    tagline: row.tagline,
    description: row.description,
    industryId: row.industry_id,
    stageId: row.stage_id,
    industry: industries.find((i) => i.id === row.industry_id) ?? null,
    stage: stages.find((s) => s.id === row.stage_id) ?? null,
    country: row.country,
    city: row.city,
    websiteUrl: row.website_url,
    fundingAmountSought: row.funding_amount_sought,
    annualRevenue: row.annual_revenue,
    monthlyRevenue: row.monthly_revenue,
    customerCount: row.customer_count,
    employeeCount: row.employee_count,
    pitchDeckPath: row.pitch_deck_path,
    pitchDeckOriginalName: row.pitch_deck_original_name,
    elevatorPitch: row.elevator_pitch,
    linkedinUrl: row.linkedin_url,
    twitterUrl: row.twitter_url,
    instagramUrl: row.instagram_url,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Every startup belonging to the signed-in founder, oldest first (the
 * order they were created in, which is also the order "+ Add Startup"
 * naturally builds up). RLS (`founder_id = auth.uid()`) is what actually
 * stops this from ever returning someone else's rows - `founderId` here
 * only shapes the query, not the access check. Backs the My Startups
 * workspace (`app/founder/startups/page.tsx`); an empty array is the
 * normal "no startups yet" case, not an error.
 */
export async function getStartupsForFounder(
  founderId: string,
): Promise<StartupDetail[]> {
  const supabase = await createClient();

  const [{ data: rows, error }, industries, stages] = await Promise.all([
    supabase
      .from("startups")
      .select("*")
      .eq("founder_id", founderId)
      .order("created_at", { ascending: true }),
    getIndustries(),
    getStartupStages(),
  ]);

  if (error) {
    throw new Error(`Failed to load startups: ${error.message}`);
  }

  return (rows ?? []).map((row) => rowToDetail(row, industries, stages));
}

/**
 * A single startup by id, or `null` if it doesn't exist or doesn't
 * belong to `founderId`. The explicit `founder_id` filter is
 * defense-in-depth alongside RLS (same pattern as
 * `getStartupsForFounder`) - it also means a founder poking another
 * founder's startup id gets the same "not found" result as a
 * nonexistent id, rather than a distinguishable "forbidden" response
 * that would confirm the id exists.
 */
export async function getStartupById(
  startupId: string,
  founderId: string,
): Promise<StartupDetail | null> {
  const supabase = await createClient();

  const [{ data: row, error }, industries, stages] = await Promise.all([
    supabase
      .from("startups")
      .select("*")
      .eq("id", startupId)
      .eq("founder_id", founderId)
      .single(),
    getIndustries(),
    getStartupStages(),
  ]);

  if (error) {
    if (error.code === PGRST_NO_ROWS) return null;
    throw new Error(`Failed to load startup: ${error.message}`);
  }
  if (!row) return null;

  return rowToDetail(row, industries, stages);
}

/** A short-lived download URL for the founder's own pitch deck. The
 * `pitch-decks` bucket is private (see the Sprint 3 migration), so this
 * is the only way to ever view/download it - there is no public URL.
 * Storage's own RLS-equivalent policies re-check ownership on every
 * call, so passing the wrong path (or another founder's path) simply
 * fails rather than leaking a URL. */
export async function getPitchDeckSignedUrl(
  path: string,
): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("pitch-decks")
    .createSignedUrl(path, 60 * 5); // 5 minutes - just long enough to view/download

  if (error || !data) return null;
  return data.signedUrl;
}
