import { createClient } from "@/lib/supabase/server";
import { getIndustries, getStartupStages } from "@/lib/queries/profile";
import { rowToDetail } from "@/lib/queries/startup";
import { FUNDING_BUCKETS, type FundingBucketId } from "@/constants/funding-buckets";
import type { StartupDetail } from "@/types/startup";

/**
 * Server-only data fetchers for Sprint 5 (Investor Discovery). Same
 * convention as lib/queries/startup.ts: RLS (the new "Investors can
 * read published startups" policy, see the Sprint 5 migration) is what
 * actually enforces "only published startups, only for signed-in
 * investors" - the `status = 'published'` filter below shapes the
 * query for correctness/clarity and defense in depth, it isn't the
 * only thing standing between an investor and a draft startup.
 */

export const DISCOVER_PAGE_SIZE = 12;

export type DiscoverFilters = {
  q?: string;
  industryId?: string;
  stageId?: string;
  country?: string;
  funding?: FundingBucketId;
};

/**
 * Strips characters that would otherwise break PostgREST's `.or()`
 * filter-string syntax (commas separate conditions, parentheses group
 * them) or change `ilike`'s wildcard meaning (`%`, `_`). This is a
 * search box, not a pattern-matching tool, so plain removal (rather
 * than escaping) is enough - the search still works, it just treats
 * those characters as word breaks.
 */
function sanitizeSearchTerm(raw: string): string {
  return raw
    .replace(/[%_,()*]/g, " ")
    .trim()
    .slice(0, 100);
}

/**
 * One page of published, discoverable startups matching the given
 * filters - the Discover grid's data source. Always sorted newest
 * (most recently published) first. Pagination is plain offset/limit
 * rather than a keyset cursor: simpler to reason about correctly for
 * MVP scale, and the "Load more" flow (lib/discover/discover-actions.ts)
 * doesn't need to survive concurrent publishes mid-scroll perfectly -
 * see the Sprint 5 brief's "choose the approach that best fits the
 * existing technical architecture."
 */
export async function getDiscoverableStartups(
  filters: DiscoverFilters,
  offset = 0,
  limit: number = DISCOVER_PAGE_SIZE,
): Promise<{ startups: StartupDetail[]; hasMore: boolean }> {
  const supabase = await createClient();

  let query = supabase.from("startups").select("*").eq("status", "published");

  if (filters.industryId) query = query.eq("industry_id", filters.industryId);
  if (filters.stageId) query = query.eq("stage_id", filters.stageId);
  if (filters.country) query = query.eq("country", filters.country);

  if (filters.funding) {
    const bucket = FUNDING_BUCKETS.find((b) => b.id === filters.funding);
    if (bucket) {
      if (bucket.min !== null) {
        query = query.gte("funding_amount_sought", bucket.min);
      }
      if (bucket.max !== null) {
        query = query.lte("funding_amount_sought", bucket.max);
      }
    }
  }

  const term = filters.q ? sanitizeSearchTerm(filters.q) : "";
  if (term) {
    query = query.or(
      `name.ilike.%${term}%,tagline.ilike.%${term}%,description.ilike.%${term}%`,
    );
  }

  // Fetch one extra row past `limit` purely to detect whether another
  // page exists - trimmed back off below before mapping/returning.
  const { data: rows, error } = await query
    .order("published_at", { ascending: false })
    .order("id", { ascending: false })
    .range(offset, offset + limit);

  if (error) {
    throw new Error(`Failed to load startups: ${error.message}`);
  }

  const [industries, stages] = await Promise.all([
    getIndustries(),
    getStartupStages(),
  ]);

  const allRows = rows ?? [];
  const hasMore = allRows.length > limit;
  const pageRows = hasMore ? allRows.slice(0, limit) : allRows;

  return {
    startups: pageRows.map((row) => rowToDetail(row, industries, stages)),
    hasMore,
  };
}

/**
 * A single published startup by id, for the Discover in-page preview -
 * or `null` if it doesn't exist, isn't published, or (per RLS) the
 * caller isn't a signed-in investor. Deliberately indistinguishable
 * between those cases, same reasoning as `getStartupById`'s founder-id
 * check: a "not found" response never confirms whether a given id
 * exists as someone's draft startup.
 */
export async function getDiscoverableStartupById(
  startupId: string,
): Promise<StartupDetail | null> {
  const supabase = await createClient();

  const [{ data: row, error }, industries, stages] = await Promise.all([
    supabase
      .from("startups")
      .select("*")
      .eq("id", startupId)
      .eq("status", "published")
      .maybeSingle(),
    getIndustries(),
    getStartupStages(),
  ]);

  if (error) {
    throw new Error(`Failed to load startup: ${error.message}`);
  }
  if (!row) return null;

  return rowToDetail(row, industries, stages);
}
