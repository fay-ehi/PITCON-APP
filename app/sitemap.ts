import type { MetadataRoute } from "next";

import { getSiteURL } from "@/lib/site-url";

/**
 * sitemap.xml, added in the pre-launch hardening pass. Deliberately
 * just the landing page for now - /login and /signup are thin,
 * account-specific pages with no independent content worth ranking,
 * and everything under /founder and /investor requires auth (see
 * robots.ts). Add entries here if/when there's real public content to
 * point at (a blog, per-startup public pages, etc).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteURL();

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
