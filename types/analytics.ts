import type { InvestorType } from "@/constants/investor-types";

/** One point in the "views over time" trend on the Founder Analytics
 * card - one calendar day, and how many `startup_views` rows landed on
 * it (see the Sprint 12 migration's `viewed_on` column). */
export type StartupViewsByDay = {
  date: string;
  count: number;
};

/** One entry in the "recently viewed by" list - deliberately a subset
 * of an investor's profile, not the whole row: same "only select the
 * columns the view actually needs" discipline as
 * getFounderInterests/getInterestedInvestors use for the equivalent
 * interest-based investor lookup. */
export type StartupViewer = {
  investorId: string;
  fullName: string | null;
  avatarUrl: string | null;
  organization: string | null;
  investorType: InvestorType | null;
  viewedAt: string;
};

/** Everything the Founder Analytics ("Insights") card on a startup's
 * detail page needs, for one startup - see
 * `lib/queries/analytics.ts`'s `getStartupAnalytics`. */
export type StartupAnalyticsSummary = {
  totalViews: number;
  uniqueInvestorCount: number;
  /** Always exactly 14 entries, oldest first, zero-filled for days
   * with no views - so the card can render a fixed-width trend without
   * special-casing gaps. */
  viewsLast14Days: StartupViewsByDay[];
  /** Most recently viewed first, deduplicated to one entry per
   * investor (their most recent view) - capped, see
   * `getStartupAnalytics`. */
  recentViewers: StartupViewer[];
};
