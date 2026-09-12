import * as Sentry from "@sentry/nextjs";

/**
 * Edge-runtime Sentry init - covers `proxy.ts`, the one piece of this
 * app that runs on the edge runtime rather than Node. See
 * instrumentation.ts for how this gets loaded.
 */
Sentry.init({
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === "production",
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1,
  sendDefaultPii: false,
});
