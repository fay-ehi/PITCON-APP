"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";

import { StartupResultsGrid } from "@/components/investor/startup-results-grid";
import { DiscoverEmptyState } from "@/components/investor/discover-empty-state";
import { DiscoverPreviewDialog } from "@/components/investor/discover-preview-dialog";
import type { DiscoverFilters } from "@/lib/queries/discover";
import type { StartupDetail } from "@/types/startup";

/**
 * Owns everything below Discover's search/filter bar: the results
 * list-or-empty-state, and the preview dialog's open/loading/selected
 * state. Both the list (for highlighting) and the dialog (for what to
 * show) need to agree on "which startup is selected right now," so
 * that state lives here rather than in either child.
 *
 * Selection is optimistic, via `useOptimistic` rather than a hand-rolled
 * boolean override: clicking a card calls `router.push` *inside* the
 * same `startTransition` as the optimistic update, which is what lets
 * React hold the optimistic value for the whole navigation and then
 * hand back to the real, server-confirmed `selectedStartupId` the
 * instant fresh data lands - rather than us trying to detect "did the
 * navigation land" ourselves by comparing ids, which broke on
 * *reselecting the same startup* (closing id "A" then clicking "A"
 * again could get stuck closed, since "A" looks unchanged to a plain
 * equality check even though a full close-then-reopen happened). This
 * is also what makes the dialog able to open with a skeleton
 * immediately, before the real startup data has actually arrived - see
 * `dialogLoading` below.
 */
function DiscoverWorkspace({
  initialStartups,
  initialHasMore,
  filters,
  baseQuery,
  hasActiveFilters,
  clearFiltersHref,
  selectedStartupId,
  selectedStartup,
  backHref,
}: {
  initialStartups: StartupDetail[];
  initialHasMore: boolean;
  filters: DiscoverFilters;
  baseQuery: string;
  hasActiveFilters: boolean;
  clearFiltersHref: string;
  /** Server-confirmed selection, from the `startup` URL param. */
  selectedStartupId: string | null;
  /** Server-confirmed startup data for `selectedStartupId` - `null`
   * either while unselected, or if the id doesn't resolve to an
   * available published startup. */
  selectedStartup: StartupDetail | null;
  backHref: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [optimisticId, setOptimisticId] = useOptimistic<string | null, string | null>(
    selectedStartupId,
    (_current, next) => next,
  );

  function selectStartup(startupId: string, href: string) {
    startTransition(() => {
      setOptimisticId(startupId);
      router.push(href, { scroll: false });
    });
  }

  function closePreview() {
    startTransition(() => {
      setOptimisticId(null);
      router.push(backHref, { scroll: false });
    });
  }

  // The optimistic id disagreeing with the confirmed one means we're
  // still waiting on the navigation that fetches this startup's real
  // data - show a skeleton for that window rather than nothing.
  const dialogLoading = Boolean(optimisticId) && optimisticId !== selectedStartupId;
  const dialogStartup = optimisticId && !dialogLoading ? selectedStartup : null;

  return (
    <>
      {initialStartups.length > 0 ? (
        <StartupResultsGrid
          // Remount (and so reset accumulated "Load more" pages) any
          // time the active search/filters change.
          key={JSON.stringify(filters)}
          initialStartups={initialStartups}
          initialHasMore={initialHasMore}
          filters={filters}
          selectedStartupId={optimisticId}
          onSelectStartup={selectStartup}
          baseQuery={baseQuery}
        />
      ) : (
        <DiscoverEmptyState hasActiveFilters={hasActiveFilters} clearHref={clearFiltersHref} />
      )}

      <DiscoverPreviewDialog
        open={Boolean(optimisticId)}
        loading={dialogLoading}
        startup={dialogStartup}
        onOpenChange={(next) => {
          if (!next) closePreview();
        }}
      />
    </>
  );
}

export { DiscoverWorkspace };
