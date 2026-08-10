"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { StartupResultCard } from "@/components/investor/startup-result-card";
import { loadMoreDiscoverStartupsAction } from "@/lib/discover/discover-actions";
import type { DiscoverFilters } from "@/lib/queries/discover";
import type { StartupDetail } from "@/types/startup";

/**
 * The Discover results grid, plus "Load more" pagination. Local `useState`
 * seeded from the server-fetched first page - the parent (page.tsx) remounts
 * this component (via a `key` tied to the active filters) whenever
 * search/filters change, so a fresh filter never has to fight this
 * component's already-loaded pages; see the Sprint 5 brief's "RESULTS
 * LOADING" section for why pagination is client-side here rather than a
 * plain server-rendered list.
 */
function StartupResultsGrid({
  initialStartups,
  initialHasMore,
  filters,
  selectedStartupId,
  baseQuery,
}: {
  initialStartups: StartupDetail[];
  initialHasMore: boolean;
  filters: DiscoverFilters;
  selectedStartupId: string | null;
  /** Current search/filter params serialized (no leading `?`, no
   * `startup` param) - each card's link is this plus its own `startup=id`. */
  baseQuery: string;
}) {
  const [startups, setStartups] = useState(initialStartups);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleLoadMore() {
    setLoadError(null);
    startTransition(async () => {
      try {
        const result = await loadMoreDiscoverStartupsAction(filters, startups.length);
        setStartups((prev) => [...prev, ...result.startups]);
        setHasMore(result.hasMore);
      } catch {
        setLoadError("Couldn't load more startups. Please try again.");
      }
    });
  }

  function hrefFor(startupId: string): string {
    return `/investor/discover?${baseQuery ? `${baseQuery}&` : ""}startup=${startupId}`;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
        {startups.map((startup) => (
          <StartupResultCard
            key={startup.id}
            startup={startup}
            href={hrefFor(startup.id)}
            selected={startup.id === selectedStartupId}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex flex-col items-center gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={handleLoadMore} disabled={isPending}>
            {isPending ? "Loading\u2026" : "Load more startups"}
          </Button>
          {loadError && <p className="text-caption text-destructive">{loadError}</p>}
        </div>
      )}
    </div>
  );
}

export { StartupResultsGrid };
