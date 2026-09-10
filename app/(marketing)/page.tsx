import { redirect } from "next/navigation";

import { getCurrentUserProfile, roleHomePath } from "@/lib/auth/session";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { ProductShowcase } from "@/components/marketing/product-showcase";
import { FinalCTA } from "@/components/marketing/final-cta";

/**
 * The public PITCON landing page. Composes: Hero → How the whole loop
 * works (Founder + Investor journeys, one illustration) → a peek at
 * the real product → Join. Nav and footer come from the (marketing)
 * layout that wraps this page.
 *
 * The standalone Founder/Investor benefit sections and the FAQ section
 * have been retired (product-page-feel pass): the journeys already
 * live in HowItWorks, the practical details now live as captions in
 * ProductShowcase, and a page this size doesn't need a dedicated FAQ.
 * See components/marketing/founder-section.tsx and investor-section.tsx
 * in git history if any of that copy is needed again.
 *
 * Signed-in visitors are redirected straight into their app instead of
 * seeing the marketing page - same `getCurrentUserProfile()` +
 * `roleHomePath()` pattern already used to keep signed-in users off
 * /login and /signup (see those pages' redirect at the top).
 */
export default async function MarketingHomePage() {
  const current = await getCurrentUserProfile();
  if (current) redirect(roleHomePath(current.profile.role));

  return (
    <>
      <Hero />
      <HowItWorks />
      <ProductShowcase />
      <FinalCTA />
    </>
  );
}
