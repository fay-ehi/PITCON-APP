"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

import { reportError } from "@/lib/error-reporting";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";

/**
 * Marketing home page's error boundary - added in the pre-launch
 * hardening pass, same "never expose the raw error" pattern as
 * MessagesError/DiscoverError. Placed at the (marketing) group level
 * rather than inside page.tsx's folder since it's the only route in
 * this group today; SiteHeader/SiteFooter from the group layout keep
 * rendering around it.
 */
export default function MarketingError({
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
    <Container className="flex flex-col items-center gap-4 py-24 text-center">
      <div className="flex size-14 items-center justify-center rounded-pill bg-primary-50">
        <AlertCircle className="size-6 text-primary" aria-hidden />
      </div>
      <h1 className="text-h3 font-semibold text-gray-900">
        Something went wrong.
      </h1>
      <p className="max-w-sm text-small text-gray-500">
        We couldn&apos;t load this page. Please try again.
      </p>
      <Button type="button" variant="secondary" onClick={() => reset()}>
        Try again
      </Button>
    </Container>
  );
}
