"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { COUNTRIES } from "@/constants/countries";
import { FUNDING_BUCKETS } from "@/constants/funding-buckets";
import {
  ALL,
  DISCOVER_PATH,
  buildDiscoverQueryString,
  type DiscoverCurrentParams,
} from "@/lib/discover/query-params";
import type { IndustryOption, StageOption } from "@/types/profile";

/**
 * Discover's filters, as a standing left-hand sidebar panel rather
 * than the inline row of selects the old "DiscoverControls" rendered
 * above the results - a layout-only change (Industry/Stage/Country/
 * Funding are the same four filters, unchanged in behavior) requested
 * to bring Discover's shape closer to a familiar
 * search-results-with-sidebar-filters layout, using only components
 * and filters PITCON already has.
 *
 * Each `Select` still writes straight to the URL on change, same as
 * before - filters don't share local state with `discover-search-bar.tsx`,
 * they just both read/write the same query string (see
 * `lib/discover/query-params.ts`).
 *
 * UPDATED (mobile filters collapse): below `lg` this used to render as
 * a full, always-expanded card - on a phone that pushed the actual
 * results well below the fold before you'd even seen one. It's now a
 * collapsible accordion there: a compact header button (icon + "Filters"
 * + an active-count badge + a chevron) that expands the four selects on
 * tap, animated via a CSS grid-rows trick rather than max-height so the
 * transition doesn't need a hardcoded height guess. It starts expanded
 * only if filters are already active (e.g. a shared/bookmarked filtered
 * URL) so the applied filters aren't hidden by default. At `lg` and
 * above the accordion is inert (`lg:grid-rows-[1fr]`) and this renders
 * exactly as before: an always-expanded sticky sidebar with its own
 * "Filter Your Search" heading.
 */
function DiscoverFilterSidebar({
  industries,
  stages,
  current,
}: {
  industries: IndustryOption[];
  stages: StageOption[];
  current: DiscoverCurrentParams;
}) {
  const router = useRouter();

  const hasActiveFilters = Boolean(
    current.industry || current.stage || current.country || current.funding,
  );
  const activeFilterCount = [
    current.industry,
    current.stage,
    current.country,
    current.funding,
  ].filter(Boolean).length;

  const [isOpen, setIsOpen] = useState(hasActiveFilters);

  function navigate(
    overrides: Partial<
      Record<"industry" | "stage" | "country" | "funding", string | undefined>
    >,
  ) {
    const merged = { ...current, ...overrides };
    router.push(`${DISCOVER_PATH}${buildDiscoverQueryString(merged)}`, {
      scroll: false,
    });
  }

  function clearFilters() {
    navigate({
      industry: undefined,
      stage: undefined,
      country: undefined,
      funding: undefined,
    });
  }

  return (
    <Card className="gap-0 overflow-hidden p-0 lg:gap-5 lg:p-5">
      {/* Compact toggle header - mobile/tablet only */}
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="border-border flex w-full items-center justify-between gap-2 border-b px-4 py-3.5 text-left lg:hidden"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="text-primary size-4" aria-hidden />
          <span className="text-body font-semibold text-gray-900">
            Filters
          </span>
          {activeFilterCount > 0 && (
            <span className="bg-primary-50 text-primary-700 text-caption flex size-5 items-center justify-center rounded-full font-semibold">
              {activeFilterCount}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-gray-500 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {/* Heading - desktop only, where the panel is always expanded */}
      <div className="hidden items-center justify-between gap-2 lg:flex">
        <h2 className="text-body font-semibold text-gray-900">
          Filter Your Search
        </h2>
        {hasActiveFilters && (
          <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
            Clear
          </Button>
        )}
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out lg:grid-rows-[1fr]",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-4 px-4 pt-4 pb-4 lg:p-0">
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="-mt-1 -mb-1 self-end lg:hidden"
              >
                Clear filters
              </Button>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="discover-filter-industry">Industry</Label>
              <Select
                value={current.industry ?? ALL}
                onValueChange={(value) =>
                  navigate({ industry: value === ALL ? undefined : value })
                }
              >
                <SelectTrigger id="discover-filter-industry" aria-label="Filter by industry">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All industries</SelectItem>
                  {industries.map((industry) => (
                    <SelectItem key={industry.id} value={industry.id}>
                      {industry.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="discover-filter-stage">Stage</Label>
              <Select
                value={current.stage ?? ALL}
                onValueChange={(value) =>
                  navigate({ stage: value === ALL ? undefined : value })
                }
              >
                <SelectTrigger id="discover-filter-stage" aria-label="Filter by startup stage">
                  <SelectValue placeholder="Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All stages</SelectItem>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="discover-filter-country">Country</Label>
              <Select
                value={current.country ?? ALL}
                onValueChange={(value) =>
                  navigate({ country: value === ALL ? undefined : value })
                }
              >
                <SelectTrigger id="discover-filter-country" aria-label="Filter by country">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All countries</SelectItem>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="discover-filter-funding">Funding sought</Label>
              <Select
                value={current.funding ?? ALL}
                onValueChange={(value) =>
                  navigate({ funding: value === ALL ? undefined : value })
                }
              >
                <SelectTrigger id="discover-filter-funding" aria-label="Filter by funding requirement">
                  <SelectValue placeholder="Funding" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Any amount</SelectItem>
                  {FUNDING_BUCKETS.map((bucket) => (
                    <SelectItem key={bucket.id} value={bucket.id}>
                      {bucket.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export { DiscoverFilterSidebar };
