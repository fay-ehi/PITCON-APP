import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUserProfile } from "@/lib/auth/session";
import {
  DISCOVER_PAGE_SIZE,
  getDiscoverableStartupById,
  getDiscoverableStartups,
  type DiscoverFilters,
} from "@/lib/queries/discover";
import { getIndustries, getStartupStages } from "@/lib/queries/profile";
import { isFundingBucketId } from "@/constants/funding-buckets";
import { Container } from "@/components/shared/container";
import { DiscoverControls } from "@/components/investor/discover-controls";
import { StartupResultsGrid } from "@/components/investor/startup-results-grid";
import { DiscoverEmptyState } from "@/components/investor/discover-empty-state";
import { DiscoverPreviewPanel } from "@/components/investor/discover-preview-panel";
import { DiscoverPreviewEmptyState } from "@/components/investor/discover-preview-empty-state";

export const metadata: Metadata = {
  title: "Discover",
};

type DiscoverSearchParams = {
  q?: string;
  industry?: string;
  stage?: string;
  country?: string;
  funding?: string;
  startup?: string;
};

/**
 * Investor Discover - the core Sprint 5 experience: "Investor logs in
 * -> Discover -> Immediately sees startups -> Search/Filter if desired
 * -> Select startup -> preview appears INSIDE Discover." See the
 * Sprint 5 brief in full for the product decisions this implements.
 *
 * Master-detail state (search, filters, and which startup is selected)
 * all lives in the URL's search params, read here in one place -
 * refresh, browser back/forward, and "does my filtered view survive
 * selecting a startup" all fall out of that for free, per the brief's
 * "SEARCH + FILTER URL STATE" section. The desktop-vs-mobile split
 * (list+preview side by side vs. one full-width pane at a time) is
 * plain responsive Tailwind classes computed from `selectedStartupId`
 * below - no client-side layout logic needed for it at all.
 */
export default async function InvestorDiscoverPage({
  searchParams,
}: {
  searchParams: Promise<DiscoverSearchParams>;
}) {
  const params = await searchParams;

  const current = await getCurrentUserProfile();
  if (!current) redirect("/login?next=/investor/discover");

  const q = params.q?.trim() || undefined;
  const industryId = params.industry || undefined;
  const stageId = params.stage || undefined;
  const country = params.country || undefined;
  const funding = isFundingBucketId(params.funding) ? params.funding : undefined;
  const selectedStartupId = params.startup || undefined;

  const filters: DiscoverFilters = { q, industryId, stageId, country, funding };
  const hasActiveFilters = Boolean(q || industryId || stageId || country || funding);

  const [{ startups, hasMore }, industries, stages, selectedStartup] = await Promise.all([
    getDiscoverableStartups(filters, 0, DISCOVER_PAGE_SIZE),
    getIndustries(),
    getStartupStages(),
    selectedStartupId ? getDiscoverableStartupById(selectedStartupId) : Promise.resolve(null),
  ]);

  // The query string every card link and the mobile "back" link build
  // on top of - current filters, without `startup` (each consumer adds
  // its own).
  const baseParams = new URLSearchParams();
  if (q) baseParams.set("q", q);
  if (industryId) baseParams.set("industry", industryId);
  if (stageId) baseParams.set("stage", stageId);
  if (country) baseParams.set("country", country);
  if (funding) baseParams.set("funding", funding);
  const baseQuery = baseParams.toString();

  const backHref = `/investor/discover${baseQuery ? `?${baseQuery}` : ""}`;
  // "Clear search and filters" keeps whatever's selected open, per the
  // preview pane's own persistence - see discover-preview-panel.tsx.
  const clearFiltersHref = `/investor/discover${
    selectedStartupId ? `?startup=${selectedStartupId}` : ""
  }`;

  // Mobile: exactly one pane full-width at a time. Desktop (`lg:`):
  // both panes always visible, regardless of selection.
  const listPaneClass = selectedStartupId ? "hidden lg:block" : "block";
  const previewPaneClass = selectedStartupId ? "block" : "hidden lg:block";

  return (
    <Container className="py-8 sm:py-10">
      <div className="mb-6">
        <h1 className="text-h2 text-gray-900">Discover Startups</h1>
        <p className="mt-1 text-small text-gray-500">
          Startups on PITCON, ready to meet investors like you.
        </p>
      </div>

      <DiscoverControls
        industries={industries}
        stages={stages}
        current={{ q: q ?? "", industry: industryId, stage: stageId, country, funding }}
      />

      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className={listPaneClass}>
          {startups.length > 0 ? (
            <StartupResultsGrid
              // Remount (and so reset accumulated "Load more" pages) any
              // time the active search/filters change - see
              // startup-results-grid.tsx's top comment.
              key={JSON.stringify(filters)}
              initialStartups={startups}
              initialHasMore={hasMore}
              filters={filters}
              selectedStartupId={selectedStartupId ?? null}
              baseQuery={baseQuery}
            />
          ) : (
            <DiscoverEmptyState hasActiveFilters={hasActiveFilters} clearHref={clearFiltersHref} />
          )}
        </div>

        <div className={previewPaneClass}>
          {selectedStartupId ? (
            selectedStartup ? (
              <DiscoverPreviewPanel startup={selectedStartup} backHref={backHref} />
            ) : (
              <DiscoverPreviewEmptyState notFound />
            )
          ) : (
            <DiscoverPreviewEmptyState />
          )}
        </div>
      </div>
    </Container>
  );
}
