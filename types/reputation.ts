/**
 * Sprint 14 - a deliberately modest alternative to a self-reported
 * "past investments" ledger (see lib/queries/reputation.ts's top
 * comment for the full reasoning). Every field here is derived from
 * something PITCON itself observed, not something either side typed
 * into a form, which is the entire point: it can't be fabricated to
 * look more trustworthy than it is.
 */
export type EngagementSummary = {
  memberSince: string;
  /** Investors only - how many startups they've expressed interest in,
   * across the whole platform (not just the founder currently looking
   * at this). `null` for a founder. */
  interestCount: number | null;
  /** `null` when there isn't yet a single conversation to measure -
   * showing "0%" for a brand-new, otherwise-legitimate user would read
   * as a red flag it hasn't earned. */
  engagementRate: { activeConversations: number; totalConversations: number } | null;
};
