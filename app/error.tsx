"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

import { reportError } from "@/lib/error-reporting";
import { Container } from "@/components/shared/container";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Root-level fallback error boundary - catches anything a layout below
 * app/layout.tsx throws (app/founder/layout.tsx, app/investor/layout.tsx,
 * the (auth) and (marketing) layouts) that isn't already caught by a
 * more specific route's own error.tsx. error.tsx never catches errors
 * thrown by the layout.tsx in its own segment, only by that segment's
 * children - so this is what catches a failure in founder/layout.tsx's
 * or investor/layout.tsx's own data fetching (unread counts, role
 * check), which none of the per-route boundaries below them can reach.
 * Route-level pages keep their own tailored error.tsx where it's worth
 * it (messages, discover, etc) - this is the safety net underneath all
 * of them, not a replacement.
 */
export default function RootError({
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
    <Container className="flex min-h-svh items-center justify-center py-16">
      <Card className="items-center py-4 text-center">
        <CardContent className="flex flex-col items-center gap-4 py-14">
          <div className="flex size-14 items-center justify-center rounded-pill bg-primary-50">
            <AlertCircle className="size-6 text-primary" aria-hidden />
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-h3 font-semibold text-gray-900">
              Something went wrong.
            </h2>
            <p className="max-w-sm text-small text-gray-500">
              We hit an unexpected error. Please try again.
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
