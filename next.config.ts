import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  /* config options here */
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
