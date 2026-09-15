import type { StartupDetail } from "@/types/startup";

/** One row on the Investor's "My Shortlist" page - the full startup
 * detail (same shape Discover already resolves) plus when it was
 * shortlisted, for sorting/display. See `lib/queries/shortlist.ts`'s
 * `getShortlistedStartups`. */
export type ShortlistedStartup = StartupDetail & {
  shortlistedAt: string;
};
