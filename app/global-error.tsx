"use client";

import { useEffect } from "react";

import { reportError } from "@/lib/error-reporting";

/**
 * Root-level error boundary - only fires if app/layout.tsx itself throws
 * (Providers, font loading, etc). Per Next.js's contract, global-error.tsx
 * replaces the root layout entirely while it's active, so unlike every
 * other error.tsx in this app it has to render its own <html>/<body> and
 * can't assume anything layout.tsx normally provides (fonts, Providers).
 * Added in the pre-launch hardening pass - previously nothing caught a
 * root layout failure and it fell through to Next's default error page.
 */
export default function GlobalError({
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
    <html lang="en">
      <body className="flex min-h-svh flex-col items-center justify-center gap-4 bg-white px-4 text-center font-sans">
        <h1 className="text-2xl font-semibold text-gray-900">
          Something went wrong.
        </h1>
        <p className="max-w-sm text-sm text-gray-500">
          We hit an unexpected error loading PITCON. Please try again.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-[#7634C8] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
