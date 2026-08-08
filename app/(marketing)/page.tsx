import { Hero } from "@/components/marketing/hero";

/**
 * Minimal functioning entry point for Sprint 0 only. The real landing
 * page (Pinterest-style visual storytelling, product screenshots,
 * collage/SVG hero) is a later sprint: it depends on the product
 * actually existing first. This just proves the design system end to
 * end: typography scale, color tokens, spacing, and button variants.
 *
 * The hero itself lives in components/marketing/hero.tsx so the same
 * markup can be reused (blurred) as the backdrop behind the desktop auth
 * screens, see app/(auth)/layout.tsx.
 */
export default function MarketingHomePage() {
  return <Hero />;
}
