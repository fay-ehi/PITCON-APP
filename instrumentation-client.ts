import * as Sentry from "@sentry/nextjs";

/**
 * Client-side Sentry init - error monitoring, added in the pre-launch
 * hardening pass (see the audit's "Add operational visibility"). This
 * file (rather than the older `sentry.client.config.ts`) is Next.js's
 * current convention: anything here runs once, early, in the browser,
 * before hydration.
 *
 * Disabled outside production so local/CI dev noise never reaches
 * Sentry and nobody needs a real DSN to run `npm run dev`. See
 * .env.example for how to get NEXT_PUBLIC_SENTRY_DSN once you've
 * created a Sentry project.
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === "production",

  // 100% in dev (if ever enabled locally), a modest sample in
  // production - tune this once real traffic volume is known.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1,

  // No IP addresses / request headers attached to events by default -
  // Sentry.setUser() (see app/founder/layout.tsx, app/investor/layout.tsx)
  // is the deliberate, minimal identifier attached instead.
  sendDefaultPii: false,
});

// Required by the SDK to instrument client-side route transitions
// (App Router navigations don't fire full page loads, so Sentry needs
// this hook to know when one starts).
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
