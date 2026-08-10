"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES } from "@/constants/countries";
import { FUNDING_BUCKETS } from "@/constants/funding-buckets";
import type { IndustryOption, StageOption } from "@/types/profile";

/** Sentinel item value for Radix `Select` (which can't hold an empty
 * string as an item value) meaning "no filter applied" - translated
 * back to "omit this param" wherever it's read. */
const ALL = "all";

const DISCOVER_PATH = "/investor/discover";
const SEARCH_DEBOUNCE_MS = 350;

export type DiscoverCurrentParams = {
  q: string;
  industry?: string;
  stage?: string;
  country?: string;
  funding?: string;
};

function buildQueryString(params: Record<string, string | undefined>): string {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) usp.set(key, value);
  }
  const serialized = usp.toString();
  return serialized ? `?${serialized}` : "";
}

/**
 * Search + Industry/Stage/Country/Funding filters for Discover. Deliberately
 * one component rather than a separate search box and filter bar: both
 * read and write the same URL search-param state, and keeping that in
 * one place avoids two independent `router.push` calls racing each
 * other when a person, say, clears a filter right after typing a
 * search term.
 *
 * The `startup` (selected-preview) param is intentionally left alone by
 * every action here - changing search/filters doesn't clear whatever's
 * open in the preview pane, per the Sprint 5 brief's "Selecting a
 * startup does not destroy the current discovery context" (read here as
 * cutting both ways: discovery context shouldn't destroy a selection,
 * either).
 */
function DiscoverControls({
  industries,
  stages,
  current,
}: {
  industries: IndustryOption[];
  stages: StageOption[];
  current: DiscoverCurrentParams;
}) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(current.q);
  const [syncedQ, setSyncedQ] = useState(current.q);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the input in sync when `current.q` changes from outside this
  // component - browser back/forward, or the empty-state's "Clear
  // search and filters" link. Adjusted during render (React's
  // recommended alternative to a `useEffect` that only calls
  // `setState`) rather than in an effect, to avoid an extra
  // render-then-effect-then-render round trip.
  if (current.q !== syncedQ) {
    setSyncedQ(current.q);
    setSearchValue(current.q);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function navigate(
    overrides: Partial<Record<"q" | "industry" | "stage" | "country" | "funding", string | undefined>>,
    mode: "push" | "replace" = "push",
  ) {
    const merged = { ...current, ...overrides };
    const url = `${DISCOVER_PATH}${buildQueryString(merged)}`;
    if (mode === "replace") router.replace(url, { scroll: false });
    else router.push(url, { scroll: false });
  }

  function handleSearchChange(value: string) {
    setSearchValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      navigate({ q: value || undefined }, "replace");
    }, SEARCH_DEBOUNCE_MS);
  }

  const hasActiveFilters = Boolean(
    current.industry || current.stage || current.country || current.funding,
  );

  function clearFilters() {
    navigate({ industry: undefined, stage: undefined, country: undefined, funding: undefined });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400"
          aria-hidden
        />
        <Input
          type="search"
          value={searchValue}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Search startups..."
          aria-label="Search startups"
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={current.industry ?? ALL}
          onValueChange={(value) => navigate({ industry: value === ALL ? undefined : value })}
        >
          <SelectTrigger aria-label="Filter by industry" className="w-auto min-w-[9.5rem]">
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

        <Select
          value={current.stage ?? ALL}
          onValueChange={(value) => navigate({ stage: value === ALL ? undefined : value })}
        >
          <SelectTrigger aria-label="Filter by startup stage" className="w-auto min-w-[8.5rem]">
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

        <Select
          value={current.country ?? ALL}
          onValueChange={(value) => navigate({ country: value === ALL ? undefined : value })}
        >
          <SelectTrigger aria-label="Filter by country" className="w-auto min-w-[8.5rem]">
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

        <Select
          value={current.funding ?? ALL}
          onValueChange={(value) => navigate({ funding: value === ALL ? undefined : value })}
        >
          <SelectTrigger aria-label="Filter by funding requirement" className="w-auto min-w-[9.5rem]">
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

        {hasActiveFilters && (
          <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}

export { DiscoverControls };
