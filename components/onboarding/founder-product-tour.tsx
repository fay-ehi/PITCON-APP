"use client";

import { ProductTour } from "@/components/onboarding/product-tour";
import { FOUNDER_TOUR_STEPS } from "@/components/onboarding/tour-steps";

/**
 * Rendered from `app/founder/startups/page.tsx` (My Startups - the
 * Founder's landing workspace, per the Sprint 4 brief) with the
 * authenticated founder's `product_tour_completed` flag from
 * `getCurrentUserProfile()`. That flag is checked server-side, from the
 * real profile row, not a client-supplied role - per the brief's
 * "SECURITY" section - so `initiallyCompleted` is trustworthy by the
 * time it reaches here.
 *
 * Renders nothing at all once the tour is done - not `<ProductTour
 * open={false} .../>` - so a returning founder never even mounts the
 * dialog machinery, and there's no closed-dialog remnant in the DOM.
 */
function FounderProductTour({
  initiallyCompleted,
}: {
  initiallyCompleted: boolean;
}) {
  if (initiallyCompleted) return null;

  return (
    <ProductTour
      steps={FOUNDER_TOUR_STEPS}
      ariaLabel="Welcome to PITCON — a quick tour for founders"
    />
  );
}

export { FounderProductTour };
