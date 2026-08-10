"use server";

import { DISCOVER_PAGE_SIZE, getDiscoverableStartups } from "@/lib/queries/discover";
import type { DiscoverFilters } from "@/lib/queries/discover";
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
