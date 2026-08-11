"use server";

import { DISCOVER_PAGE_SIZE, getDiscoverableStartupById, getDiscoverableStartups } from "@/lib/queries/discover";
import type { DiscoverFilters } from "@/lib/queries/discover";
import { getPitchDeckSignedUrl } from "@/lib/queries/startup";
import type { StartupDetail } from "@/types/startup";

/**
 * Fetches the next page of Discover results for the "Load more" button
 * (components/investor/startup-results-grid.tsx). No explicit
 * auth/role check here by design, same convention as the rest of the
 * data layer: `getDiscoverableStartups` runs through the caller's own
 * Supabase session, so the Sprint 5 "Investors can read published
 * startups" RLS policy is what actually decides what comes back - a
 * non-investor session simply gets an empty page, not an error.
 */
export async function loadMoreDiscoverStartupsAction(
  filters: DiscoverFilters,
  offset: number,
): Promise<{ startups: StartupDetail[]; hasMore: boolean }> {
  return getDiscoverableStartups(filters, offset, DISCOVER_PAGE_SIZE);
}

/**
 * Generates a fresh, short-lived URL for the "Open pitch deck" control
 * in the Discover preview (components/investor/discover-preview-dialog.tsx).
 * Re-fetches the startup by id rather than trusting a path passed in
 * from the client, for the same reason `getStartupById` re-checks
 * `founder_id`: never trust an id/path pair the caller supplies as
 * proof of anything on its own.
 *
 * `getPitchDeckSignedUrl` itself succeeds or fails based on the
 * Sprint 5 "Investors can read pitch decks for published startups"
 * storage policy - this action doesn't duplicate that check, it just
 * turns "no access" into a readable message instead of a null URL.
 */
export async function getDiscoverPitchDeckUrlAction(
  startupId: string,
): Promise<{ url: string } | { error: string }> {
  const startup = await getDiscoverableStartupById(startupId);

  if (!startup || !startup.pitchDeckPath) {
    return { error: "This pitch deck isn't available." };
  }

  const url = await getPitchDeckSignedUrl(startup.pitchDeckPath);
  if (!url) {
    return { error: "Couldn't open the pitch deck. Please try again." };
  }

  return { url };
}
