"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

import { reportError } from "@/lib/error-reporting";
import { Container } from "@/components/shared/container";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Investor settings' error boundary - added in the pre-launch hardening
 * pass, same pattern as MessagesError/DiscoverError.
 */
export default function InvestorSettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error);
  }, [error]);

  return (
    <Container className="max-w-2xl py-16">
      <Card className="items-center py-4 text-center">
        <CardContent className="flex flex-col items-center gap-4 py-14">
          <div className="flex size-14 items-center justify-center rounded-pill bg-primary-50">
            <AlertCircle className="size-6 text-primary" aria-hidden />
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-h3 font-semibold text-gray-900">
              We couldn&apos;t load your settings.
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
