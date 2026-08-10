"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Discover's error boundary - per the Sprint 5 brief's "ERROR STATES"
 * ("Provide useful error states... Do not expose raw database errors to
 * the user"). `getDiscoverableStartups`/`getDiscoverableStartupById`
 * only ever throw a generic "Failed to load..." Error; this boundary
 * doesn't surface even that, just a retry action.
 */
export default function DiscoverError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Logged for diagnostics only - never rendered to the investor.
    console.error(error);
  }, [error]);

  return (
    <Container className="py-16">
      <Card className="items-center py-4 text-center">
        <CardContent className="flex flex-col items-center gap-4 py-14">
          <div className="flex size-14 items-center justify-center rounded-pill bg-primary-50">
            <AlertCircle className="size-6 text-primary" aria-hidden />
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-h3 font-semibold text-gray-900">
              We couldn&apos;t load startups right now.
            </h2>
            <p className="max-w-sm text-small text-gray-500">
              Something went wrong on our end. Please try again.
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={() => reset()}>
            Try again
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}
