import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/marketing/reveal";

/**
 * Sprint 11 brief section 8 - a strong but simple final CTA with an
 * obvious Founder-vs-Investor choice. Kept on a white/bordered surface
 * with only soft blurred accents rather than a solid purple block,
 * per the brief's own "Avoid... huge blocks of purple" rule - purple
 * stays reserved for the two buttons, same as everywhere else on the
 * page. No guaranteed-funding/guaranteed-match language, per the
 * brief's explicit warning against exaggerated claims.
 */
function FinalCTA() {
  return (
    <section className="py-16 sm:py-24">
      <Container width="wide">
        <Reveal className="rounded-marketing border-border relative overflow-hidden border bg-white p-10 text-center sm:p-16">
          <div
            aria-hidden="true"
            className="bg-primary-50 pointer-events-none absolute -top-10 -right-10 size-40 rounded-full blur-3xl"
          />
          <div
            aria-hidden="true"
            className="bg-primary-50 pointer-events-none absolute -bottom-10 -left-10 size-40 rounded-full blur-3xl"
          />

          <h2 className="text-h1 relative text-gray-900">
            Ready to find your match?
          </h2>
          <p className="text-body-lg relative mx-auto mt-4 max-w-xl text-gray-500">
            Join as a Founder putting a startup in front of investors, or
            as an Investor looking for the next one worth backing.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/signup?role=founder">I&apos;m a Founder</Link>
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
              asChild
            >
              <Link href="/signup?role=investor">I&apos;m an Investor</Link>
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

export { FinalCTA };
