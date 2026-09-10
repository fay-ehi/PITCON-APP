import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { HeroVisual } from "@/components/marketing/hero-visual";

/**
 * The landing page hero (Pinterest-composition refresh). Structure is
 * deliberately minimal — headline, two role buttons, one login button,
 * collage — mirroring the reference's "surprisingly simple" hierarchy
 * rather than the previous eyebrow-label + supporting-paragraph layout.
 *
 * Two things carried over unchanged from the previous version, because
 * the reference composition needs the same thing:
 *
 * 1. On mobile the visual appears *before* the headline (`order-1`),
 *    reversed on desktop where text leads and the visual sits beside it
 *    (`lg:order-2`) - a single grid with Tailwind's order utilities
 *    rather than two separately-authored layouts, so there's exactly
 *    one copy of this markup in the DOM (see the note in
 *    app/(auth)/layout.tsx about why that matters here: this component
 *    is also reused, blurred, as that page's backdrop).
 * 2. Still exported as a plain no-props `Hero`, and everything here is
 *    static markup (no client state) - required for that same reuse to
 *    keep working unchanged.
 */
function Hero() {
  return (
    <Container width="wide" className="py-14 sm:py-20">
      <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
        <div aria-hidden="true" className="order-1 lg:order-2">
          <HeroVisual />
        </div>

        <div className="order-2 text-center lg:order-1 lg:pt-4 lg:text-left lg:ml-8 lg:mt-10"> 
          <h1 className="animate-in fade-in slide-in-from-bottom-4 text-h1 text-gray-900 duration-700 motion-reduce:animate-none">
            Big ideas deserve the
            <br />
           right people 
          </h1>

          <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto mt-9 max-w-sm duration-700 [animation-delay:120ms] motion-reduce:animate-none lg:mx-0">
            {/* Row 1 — the two role choices, equal weight, side by side. */}
            <div className="grid grid-cols-2 gap-3">
              <Button size="lg" className="w-full" asChild>
                <Link href="/signup?role=founder">I&apos;m a Founder</Link>
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="border-primary text-primary hover:bg-primary-50 active:bg-primary-100 hover:text-primary-700 w-full"
                asChild
              >
                <Link href="/signup?role=investor">I&apos;m an Investor</Link>
              </Button>
            </div>

            {/* Row 2 — single wide login button, clearly secondary (grey,
                no separate "Log in" link beside it - the button IS the
                login CTA). Spans the combined width of row 1 above it. */}
            <Button
              variant="secondary"
              size="lg"
              className="mt-3 w-full border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300"
              asChild
            >
              <Link href="/login">I already have an account</Link>
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}

export { Hero };
