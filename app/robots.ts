import type { MetadataRoute } from "next";

import { getSiteURL } from "@/lib/site-url";

/**
 * robots.txt, added in the pre-launch hardening pass. /founder and
 * /investor are auth-gated app workspaces, not content anyone should
 * land on from search - proxy.ts already redirects a signed-out crawler
 * straight to /login for those anyway, so disallowing them here just
 * saves crawl budget rather than protecting anything. /admin is the
 * same idea, plus it's not something to hint exists to a crawler at
 * all (see app/admin/layout.tsx's own comment on that).
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteURL();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/founder", "/investor", "/admin"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
