import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  experimental: {
    // Server Actions default to a 1MB request body limit, unrelated to
    // any app-level or Supabase Storage bucket limit. Without this,
    // every "use server" upload action (logo/cover via
    // lib/startup/asset-actions.ts, avatar via
    // lib/profile/avatar-actions.ts, pitch deck via
    // lib/startup/pitch-deck-actions.ts) gets cut off well below the
    // 5MB/8MB/20MB the UI advertises and asset-constraints.ts /
    // avatar-constraints.ts enforce. See
    // https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions#bodysizelimit
    serverActions: {
      bodySizeLimit: "25mb",
    },
    // Separate from the above: Next.js 16's proxy.ts (the renamed
    // middleware.ts) buffers the request body in memory so both the
    // proxy and the route/action can read it, capped at 10MB by
    // default. Exceeding it doesn't error - it silently truncates the
    // body - which would corrupt a >10MB pitch deck upload even with
    // bodySizeLimit above raised. Kept at the same ceiling. See
    // https://nextjs.org/docs/app/api-reference/config/next-config-js/proxyClientMaxBodySize
    proxyClientMaxBodySize: "25mb",
  },
};

export default withSentryConfig(nextConfig, {
  // All optional and only used for uploading source maps at build time
  // (so a Sentry stack trace shows your real source, not minified
  // output) - unset in every environment until you've created a Sentry
  // project and a CI auth token, and the plugin just skips the upload
  // with a warning when they're missing rather than failing the build.
  // See .env.example.
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  silent: true,
});
