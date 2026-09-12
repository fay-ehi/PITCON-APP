import * as Sentry from "@sentry/nextjs";

/**
 * Server-side (Node runtime) Sentry init - see instrumentation.ts for
 * how this gets loaded, and instrumentation-client.ts for the
 * matching browser-side config and rationale.
 */
Sentry.init({
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === "production",
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1,
  sendDefaultPii: false,
});
