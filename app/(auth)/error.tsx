"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

import { reportError } from "@/lib/error-reporting";
import { Button } from "@/components/ui/button";

/**
 * Shared error boundary for every auth screen (login, signup, forgot
 * password, reset password, verify email) - added in the pre-launch
 * hardening pass. Placed at the (auth) group level, not per-page: all
 * five share the same layout.tsx card chrome and the same "couldn't
 * load this page" framing, and none benefit from a bespoke message.
 * No Container/Card wrapper here, matching how the pages themselves
 * render - the (auth) layout already supplies the centered card.
 */
export default function AuthError({
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
    <div className="text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-50">
        <AlertCircle className="size-6 text-primary" aria-hidden />
      </div>
      <h1 className="mt-6 text-h2 text-gray-900">Something went wrong.</h1>
      <p className="mt-3 text-body text-gray-500">
        We couldn&apos;t load this page. Please try again.
      </p>
      <Button
        type="button"
        variant="secondary"
        className="mt-6 w-full"
        onClick={() => reset()}
      >
        Try again
      </Button>
    </div>
  );
}
