import { createClient } from "@/lib/supabase/server";
import { getIndustries, getStartupStages } from "@/lib/queries/profile";
import { rowToDetail } from "@/lib/queries/startup";
import type { ShortlistedStartup } from "@/types/shortlist";

/**
 * Every startup id the signed-in investor has shortlisted, in no
 * particular order - used to mark Discover result cards (and the
 * preview dialog) as already-shortlisted on first paint. Deliberately
 * the investor's *entire* shortlist, not scoped to whichever page of
 * Discover results happens to be loaded: fetching it once up front
 * means "Load more" pages (loadMoreDiscoverStartupsAction) don't need
 * their own shortlist lookup at all - see discover-workspace.tsx. Cheap
 * even for an active investor, since it's a plain list of ids, not full
 * startup rows.
 */
export async function getShortlistedStartupIds(
  investorId: string,
): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("startup_shortlists")
    .select("startup_id")
    .eq("investor_id", investorId);

  if (error) {
    throw new Error(`Failed to load shortlist: ${error.message}`);
  }

  return (data ?? []).map((row) => row.startup_id);
}

/**
 * The signed-in investor's full shortlist, most recently shortlisted
 * first - backs `/investor/shortlist`. Relies on the same "startups
 * they've shortlisted" RLS policy (Sprint 12 migration) that
 * `getDiscoverableStartupById` relies on for `startup_interests`: a
 * startup the founder later unpublishes still shows up here rather than
 * silently disappearing from the investor's own list.
 */
export async function getShortlistedStartups(
  investorId: string,
): Promise<ShortlistedStartup[]> {
  const supabase = await createClient();

  const [{ data: shortlistRows, error: shortlistError }, industries, stages] =
    await Promise.all([
      supabase
        .from("startup_shortlists")
        .select("startup_id, created_at")
        .eq("investor_id", investorId)
        .order("created_at", { ascending: false }),
      getIndustries(),
      getStartupStages(),
    ]);

  if (shortlistError) {
    throw new Error(`Failed to load shortlist: ${shortlistError.message}`);
  }

  const shortlist = shortlistRows ?? [];
  if (shortlist.length === 0) return [];

  const startupIds = shortlist.map((row) => row.startup_id);
  const { data: startupRows, error: startupsError } = await supabase
    .from("startups")
    .select("*")
    .in("id", startupIds);

  if (startupsError) {
    throw new Error(`Failed to load startups: ${startupsError.message}`);
  }

  const startupById = new Map((startupRows ?? []).map((row) => [row.id, row]));

  // Preserves the shortlist's own most-recently-shortlisted-first
  // order rather than whatever order `.in()` happens to return, and
  // drops a shortlist entry whose startup row no longer resolves at
  // all (deleted outright, not just unpublished - the RLS policy above
  // only covers "still exists but unpublished").
  return shortlist
    .map((row) => {
      const startupRow = startupById.get(row.startup_id);
      if (!startupRow) return null;
      return {
        ...rowToDetail(startupRow, industries, stages),
        shortlistedAt: row.created_at,
      };
    })
    .filter((row): row is ShortlistedStartup => row !== null);
}
