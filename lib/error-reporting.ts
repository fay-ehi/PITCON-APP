import * as Sentry from "@sentry/nextjs";

/**
 * Called from every error.tsx's/global-error.tsx's useEffect, added in
 * the pre-launch hardening pass. Before this, a thrown error was only
 * ever visible via `console.error` in whatever picks up server/browser
 * logs - now it's also reported to Sentry (once NEXT_PUBLIC_SENTRY_DSN
 * is configured; see .env.example), with the `digest` Next.js attaches
 * to server-side errors so the client-side event here can be
 * correlated with the matching server log line.
 *
 * Always logs locally too, not just when Sentry is configured - this
 * still needs to be useful in local dev with no DSN set.
 */
export function reportError(error: Error & { digest?: string }): void {
  console.error(error);
  Sentry.captureException(error, {
    tags: { digest: error.digest },
  });
}
