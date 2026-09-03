"use client";

import { ProductTour } from "@/components/onboarding/product-tour";
import { INVESTOR_TOUR_STEPS } from "@/components/onboarding/tour-steps";

/**
 * Rendered from `app/investor/discover/page.tsx` (Discover - the
 * Investor's landing workspace, per the Sprint 5 brief) with the
 * authenticated investor's `product_tour_completed` flag from
 * `getCurrentUserProfile()`. See `FounderProductTour` for the mirrored
 * founder-side rationale - same "server-verified flag, render nothing
 * once done" shape.
 */
function InvestorProductTour({
  initiallyCompleted,
}: {
  initiallyCompleted: boolean;
}) {
  if (initiallyCompleted) return null;

  return (
    <ProductTour
      steps={INVESTOR_TOUR_STEPS}
      ariaLabel="Welcome to PITCON — a quick tour for investors"
    />
  );
}

export { InvestorProductTour };
