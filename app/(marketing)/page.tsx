import { redirect } from "next/navigation";

import { getCurrentUserProfile, roleHomePath } from "@/lib/auth/session";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { ProductShowcase } from "@/components/marketing/product-showcase";
import { FounderSection } from "@/components/marketing/founder-section";
import { InvestorSection } from "@/components/marketing/investor-section";
import { FAQ } from "@/components/marketing/faq";
import { FinalCTA } from "@/components/marketing/final-cta";

/**
 * The public PITCON landing page (Sprint 11). Composes the sections in
 * the brief's progression: What is PITCON? → How does it work? → What
 * does it actually look like? → Why should I use it? → Join. Nav and
 * footer come from the (marketing) layout that wraps this page.
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
      <FounderSection />
      <InvestorSection />
      <FAQ />
      <FinalCTA />
    </>
  );
}
