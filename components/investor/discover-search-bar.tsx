"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { DISCOVER_PATH, buildDiscoverQueryString } from "@/lib/discover/query-params";
import type { DiscoverCurrentParams } from "@/lib/discover/query-params";

const SEARCH_DEBOUNCE_MS = 350;

/**
 * Discover's search box - split out of what used to be a single
 * "DiscoverControls" component (search + filters together) so the
 * layout-morph brief could put this in the main column and the filters
 * in a left sidebar (`discover-filter-sidebar.tsx`) without the two
 * fighting over one component's internal state.
 *
 * Reads/writes the same `q` URL search param the filters read/write
 * (see `lib/discover/query-params.ts`) - each side only ever touches
 * its own param(s) when navigating, so typing a search term can't clobber
 * an active filter or vice versa.
 */
function DiscoverSearchBar({ current }: { current: DiscoverCurrentParams }) {
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

  function handleSearchChange(value: string) {
    setSearchValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const merged = { ...current, q: value || undefined };
      router.replace(`${DISCOVER_PATH}${buildDiscoverQueryString(merged)}`, {
        scroll: false,
      });
    }, SEARCH_DEBOUNCE_MS);
  }

  return (
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
  );
}

export { DiscoverSearchBar };
