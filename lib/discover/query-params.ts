/** Sentinel item value for Radix `Select` (which can't hold an empty
 * string as an item value) meaning "no filter applied" - translated
 * back to "omit this param" wherever it's read. */
export const ALL = "all";

export const DISCOVER_PATH = "/investor/discover";

export type DiscoverCurrentParams = {
  q: string;
  industry?: string;
  stage?: string;
  country?: string;
  funding?: string;
};

/**
 * Serializes a Discover params object into a query string (no leading
 * `?` unless there's at least one param, matching `URLSearchParams`'s
 * own `.toString()` shape). Shared by `discover-search-bar.tsx` and
 * `discover-filter-sidebar.tsx` so search and filters build URLs the
 * same way, whichever one is navigating.
 */
export function buildDiscoverQueryString(
  params: Record<string, string | undefined>,
): string {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) usp.set(key, value);
  }
  const serialized = usp.toString();
  return serialized ? `?${serialized}` : "";
}
