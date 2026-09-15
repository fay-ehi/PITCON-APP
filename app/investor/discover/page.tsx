import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { after } from "next/server";

import { getCurrentUserProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  DISCOVER_PAGE_SIZE,
  getDiscoverableStartupById,
  getDiscoverableStartups,
  type DiscoverFilters,
} from "@/lib/queries/discover";
import { getOwnInterestForStartup } from "@/lib/queries/interests";
import { getShortlistedStartupIds } from "@/lib/queries/shortlist";
import { getIndustries, getStartupStages } from "@/lib/queries/profile";
import { logStartupView } from "@/lib/analytics/track-view";
import { isFundingBucketId } from "@/constants/funding-buckets";
import { Container } from "@/components/shared/container";
import { DiscoverControls } from "@/components/investor/discover-controls";
import { DiscoverWorkspace } from "@/components/investor/discover-workspace";
import { InvestorProductTour } from "@/components/onboarding/investor-product-tour";

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
 * "SEARCH + FILTER URL STATE" section.
 *
 * Results render as a single-column list of long, full-width cards
 * (startup-result-card.tsx); selecting one opens the preview as a
 * modal overlay (discover-preview-dialog.tsx) rather than a
 * permanently-visible side panel - full-screen on mobile/tablet, a
 * large centered panel over a dimmed backdrop on desktop. Selection
 * state itself (and the optimistic-open/skeleton behavior that comes
 * with it) is owned by discover-workspace.tsx, a client component -
 * see its top comment for why that's `useOptimistic`-based rather than
 * driven directly off these server-fetched props.
 *
 * Sprint 6 adds one more piece of server-fetched state alongside
 * `selectedStartup`: whether the signed-in investor already has an
 * interest in it (`ownInterest`), so the preview dialog's "Express
 * Interest" control renders in the right state on first paint - no
 * loading flash, no client-only guess. Fetched the same way, gated the
 * same way (only when a startup is actually selected).
 *
 * As of Sprint 10, this is also where the first-time product tour
 * appears - per that brief's "BACKGROUND APPLICATION" section, it's
 * shown over Discover specifically because that's the investor's real
 * landing workspace. `current.profile.product_tour_completed` comes
 * from the same authenticated profile row already fetched below, so
 * showing the tour costs no extra query.
 *
 * Sprint 12 adds two more things here. First, `shortlistedIds` - the
 * investor's entire shortlist, fetched once regardless of which
 * startup (if any) is selected, so `DiscoverWorkspace` can mark
 * already-shortlisted cards on first paint. Second, a Founder
 * Analytics view log for `selectedStartup`, fired via `after()` so it
 * never adds latency to this page's own response - the investor's own
 * page load doesn't wait on it. That `after()` call is why `supabase`
 * is created explicitly here rather than left to `logStartupView`
 * itself: `cookies()` (which `createClient()` calls) can't be called
 * *inside* `after()` in a Server Component per Next's docs, so the
 * client has to be built during normal render and only the deferred
 * `.insert()` call happens inside the callback - see
 * lib/analytics/track-view.ts's top comment for the full reasoning.
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

  const [{ startups, hasMore }, industries, stages, selectedStartup, ownInterest, shortlistedIds] =
    await Promise.all([
      getDiscoverableStartups(filters, 0, DISCOVER_PAGE_SIZE),
      getIndustries(),
      getStartupStages(),
      selectedStartupId ? getDiscoverableStartupById(selectedStartupId) : Promise.resolve(null),
      selectedStartupId
        ? getOwnInterestForStartup(current.userId, selectedStartupId)
        : Promise.resolve(null),
      getShortlistedStartupIds(current.userId),
    ]);

  if (selectedStartup) {
    const supabase = await createClient();
    after(() => logStartupView(supabase, selectedStartup.id, current.userId));
  }

  // The query string every card link, the dialog's "back" close
  // action, and "Clear search and filters" build on top of - current
  // filters, without `startup` (each consumer adds its own).
  const baseParams = new URLSearchParams();
  if (q) baseParams.set("q", q);
  if (industryId) baseParams.set("industry", industryId);
  if (stageId) baseParams.set("stage", stageId);
  if (country) baseParams.set("country", country);
  if (funding) baseParams.set("funding", funding);
  const baseQuery = baseParams.toString();

  const backHref = `/investor/discover${baseQuery ? `?${baseQuery}` : ""}`;
  const clearFiltersHref = "/investor/discover";

  return (
    <Container className="py-8 sm:py-10">
      <InvestorProductTour
        initiallyCompleted={current.profile.product_tour_completed}
      />

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

      <div className="mt-6">
        <DiscoverWorkspace
          initialStartups={startups}
          initialHasMore={hasMore}
          filters={filters}
          baseQuery={baseQuery}
          hasActiveFilters={hasActiveFilters}
          clearFiltersHref={clearFiltersHref}
          selectedStartupId={selectedStartupId ?? null}
          selectedStartup={selectedStartup}
          ownInterestStatus={ownInterest?.status ?? null}
          initialShortlistedIds={shortlistedIds}
          backHref={backHref}
        />
      </div>
    </Container>
  );
}
