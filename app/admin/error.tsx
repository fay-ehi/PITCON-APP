"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

import { reportError } from "@/lib/error-reporting";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Admin overview's error boundary - added alongside the admin view
 * itself, same pattern as every other route's error.tsx from the
 * pre-launch hardening pass. No <Container> wrapper here, unlike most
 * of the app's error.tsx files - app/admin/layout.tsx's own <main>
 * already supplies the max-width/padding shell, same reasoning as the
 * (auth) group's error.tsx not re-wrapping its own layout's card.
 */
export default function AdminError({
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
            Couldn&apos;t load the admin overview. Please try again.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => reset()}>
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}
