"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Messages' error boundary - mirrors app/founder/messages/error.tsx; see
 * its comment for the reasoning.
 */
export default function InvestorMessagesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="py-16">
      <Card className="items-center py-4 text-center">
        <CardContent className="flex flex-col items-center gap-4 py-14">
          <div className="rounded-pill bg-primary-50 flex size-14 items-center justify-center">
            <AlertCircle className="text-primary size-6" aria-hidden />
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-h3 font-semibold text-gray-900">
              We couldn&apos;t load your messages.
            </h2>
            <p className="text-small max-w-sm text-gray-500">
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
