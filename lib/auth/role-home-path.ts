import type { UserRole } from "@/types/profile";

/** Where a signed-in user of a given role should land. As of Sprint 4,
 * a founder's home is the My Startups workspace - `/founder` itself is
 * kept alive only as a redirect to here (see app/founder/page.tsx), for
 * old links/bookmarks. As of Sprint 5, an investor's home is the
 * Discover workspace, for the same reason - see app/investor/page.tsx.
 *
 * Lives in its own module (rather than inline in `lib/auth/session.ts`,
 * which re-exports it for every existing caller) so `proxy.ts` can use
 * it too without pulling in `lib/supabase/server.ts`'s `next/headers`
 * import, which isn't meant to run in the proxy/middleware layer.
 */
export function roleHomePath(role: UserRole): string {
  return role === "founder" ? "/founder/startups" : "/investor/discover";
}
