import Link from "next/link";
import { Search, Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

/**
 * Discover's results-pane empty state - two flavors, per the Sprint 5
 * brief's "EMPTY STATES" section. Never fabricates startup cards to
 * make the page look populated either way.
 */
function DiscoverEmptyState({
  hasActiveFilters,
  clearHref,
}: {
  hasActiveFilters: boolean;
  clearHref: string;
}) {
  return (
    <Card className="items-center py-4 text-center">
      <CardContent className="flex flex-col items-center gap-4 py-10">
        <div className="flex size-14 items-center justify-center rounded-pill bg-primary-50">
          {hasActiveFilters ? (
            <Search className="size-6 text-primary" aria-hidden />
          ) : (
            <Sparkles className="size-6 text-primary" aria-hidden />
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-h3 font-semibold text-gray-900">
            {hasActiveFilters
              ? "No startups match your search."
              : "No startups are available yet."}
          </h2>
          {!hasActiveFilters && (
            <p className="max-w-sm text-small text-gray-500">
              Check back soon as founders publish their startups on PITCON.
            </p>
          )}
        </div>
        {hasActiveFilters && (
          <Link href={clearHref} className="text-small font-medium text-primary hover:underline">
            Clear search and filters
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

export { DiscoverEmptyState };
