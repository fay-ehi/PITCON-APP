import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";

/**
 * The Sprint 0 placeholder hero. Extracted out of app/(marketing)/page.tsx
 * so it can also be reused (blurred, non-interactive) as the backdrop
 * behind the desktop auth screens, see app/(auth)/layout.tsx.
 */
function Hero() {
  return (
    <Container width="narrow" className="py-24 text-center sm:py-32">
      <p className="text-small font-semibold text-primary">
        Investor–startup matchmaking
      </p>
      <h1 className="mt-4 text-display text-gray-900">
        Where African ambition becomes funded and structured.
      </h1>
      <p className="text-body-lg mt-6 text-gray-500">
        PITCON connects founders building serious companies with investors
        looking for their next opportunity: built for the realities of
        raising and investing across Africa.
      </p>
      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button size="lg" className="w-full sm:w-auto">
          I&apos;m a founder
        </Button>
        <Button variant="secondary" size="lg" className="w-full sm:w-auto">
          I&apos;m an investor
        </Button>
      </div>
    </Container>
  );
}

export { Hero };
