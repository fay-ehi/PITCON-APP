import * as Sentry from "@sentry/nextjs";

/**
 * Next.js's server instrumentation hook - runs once when a new server
 * instance starts, before it serves any requests. Loads whichever of
 * sentry.server.config.ts / sentry.edge.config.ts matches the runtime
 * this instance is actually running (Node for Server
 * Components/Actions/Route Handlers, edge for proxy.ts).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

/**
 * Hooks Sentry into Next.js's own server-side error-reporting
 * instrumentation (errors thrown in Server Components, Route Handlers,
 * and Server Actions that Next itself catches) - this is what covers
 * server-side failures that never reach one of app/**\/error.tsx
 * because they happen outside a client-rendered boundary.
 */
export const onRequestError = Sentry.captureRequestError;
