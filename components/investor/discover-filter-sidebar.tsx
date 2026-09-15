"use client";

import { useRouter } from "next/navigation";

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

  const hasActiveFilters = Boolean(
    current.industry || current.stage || current.country || current.funding,
  );

  function clearFilters() {
    navigate({
      industry: undefined,
      stage: undefined,
      country: undefined,
      funding: undefined,
    });
  }

  return (
    <Card className="gap-5 p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-body font-semibold text-gray-900">
          Filter Your Search
        </h2>
        {hasActiveFilters && (
          <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
            Clear
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4">
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
    </Card>
  );
}

export { DiscoverFilterSidebar };
