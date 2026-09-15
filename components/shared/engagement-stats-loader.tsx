"use client";

import { useEffect, useState } from "react";

import { EngagementStats } from "@/components/shared/engagement-stats";
import { Skeleton } from "@/components/ui/skeleton";
import type { EngagementSummary } from "@/types/reputation";

/**
 * Sprint 14. Fetches on mount rather than taking the summary as a
 * prop - see reputation-actions.ts's own comment on why this is a
 * lazy, dialog-open-triggered fetch rather than something preloaded
 * for every row in a list.
 *
 * Deliberately never calls `setLoading(true)` itself - only
 * `setLoading(false)` once the fetch resolves. Resetting to a loading
 * state when the identity being looked up changes is instead the
 * caller's job, by passing `key={...}` (some id that identifies who
 * this is about) at the call site: a key change forces React to
 * unmount and remount this component fresh, which is what lets
 * `loading` start back at `true` (its initial value) with no
 * synchronous `setState` call in the effect body at all - the pattern
 * React's own lint rules push toward over manually resetting state
 * inside the effect. This matters for Discover's preview dialog, which
 * reuses one dialog instance across different startups as the investor
 * clicks through cards; it's a no-op for My Interests, where each
 * dialog instance only ever shows one fixed investor.
 */
function EngagementStatsLoader({
  fetcher,
}: {
  fetcher: () => Promise<EngagementSummary | null>;
}) {
  const [summary, setSummary] = useState<EngagementSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetcher().then((result) => {
      if (cancelled) return;
      setSummary(result);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per mount; the caller forces a fresh mount via `key` when fetchKey changes
  }, []);

  if (loading) {
    return <Skeleton className="h-4 w-40" />;
  }

  // A failed/unauthorized lookup fails quietly rather than showing an
  // error state - this is supplementary trust context, not something
  // essential to the rest of the dialog working.
  if (!summary) return null;

  return <EngagementStats summary={summary} />;
}

export { EngagementStatsLoader };
