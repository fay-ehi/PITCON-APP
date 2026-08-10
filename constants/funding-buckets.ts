/**
 * Discrete ranges for the Discover "Funding Requirement" filter (Sprint
 * 5). `startups.funding_amount_sought` itself is a plain numeric field
 * with no bucket/tier system anywhere else in the product - this list
 * exists purely to give the filter UI a small, scannable set of options
 * instead of a raw min/max numeric input, per the Sprint 5 brief's
 * "Filter according to the existing startup funding data... Do not
 * invent a second set of taxonomies" (this isn't a second taxonomy on
 * the data - the column is unchanged - just a UI grouping over it).
 */
export type FundingBucketId = "under-50k" | "50k-250k" | "250k-1m" | "1m-plus";

export type FundingBucket = {
  id: FundingBucketId;
  label: string;
  /** Inclusive lower bound, or `null` for no lower bound. */
  min: number | null;
  /** Inclusive upper bound, or `null` for no upper bound. */
  max: number | null;
};

export const FUNDING_BUCKETS: FundingBucket[] = [
  { id: "under-50k", label: "Under $50K", min: null, max: 49_999 },
  { id: "50k-250k", label: "$50K \u2013 $250K", min: 50_000, max: 250_000 },
  { id: "250k-1m", label: "$250K \u2013 $1M", min: 250_001, max: 1_000_000 },
  { id: "1m-plus", label: "$1M+", min: 1_000_001, max: null },
];

export function isFundingBucketId(
  value: string | undefined | null,
): value is FundingBucketId {
  return !!value && FUNDING_BUCKETS.some((bucket) => bucket.id === value);
}
