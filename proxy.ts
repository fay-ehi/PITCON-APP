import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { fetchWithTimeout } from "@/lib/supabase/fetch-with-timeout";
import { roleHomePath } from "@/lib/auth/role-home-path";
import type { UserRole } from "@/types/profile";

/**
 * Next.js 16 renamed `middleware.ts` -> `proxy.ts` (exported function must
 * be named `proxy`). This runs on every request matched below.
 *
 * Three responsibilities: refresh the Supabase auth session/cookies on
 * every request, redirect signed-out visitors away from every
 * `/founder` and `/investor` route (see "Route protection" below), and
 * bounce signed-in visitors off the marketing home straight into their
 * app (see "Signed-in home redirect" below). It does NOT redirect
 * signed-in users away from auth pages — that's still each auth page's
 * own `getCurrentUserProfile()` + `roleHomePath()` check (see
 * app/(auth)/login/page.tsx and friends) - and it does NOT check
 * founder-vs-investor role for route protection - see the note on that
 * below.
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
      // Bounds each auth fetch to 5s. Without this, an unreachable
      // Supabase URL (local stack not started, project paused, network
      // blocked) makes every single route stall for 25s+ while GoTrueClient
      // retries the failing fetch — see lib/supabase/fetch-with-timeout.ts.
      global: { fetch: fetchWithTimeout(5000) },
    },
  );

  // Touching auth here (rather than only in Server Components) is what
  // keeps the session cookie refreshed — do not remove this call.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- Route protection ---
  // Deliberately only checks "is anyone signed in" here, no DB query, so
  // this stays fast on every request. The founder-vs-investor role check
  // happens one layer down in app/founder/layout.tsx and
  // app/investor/layout.tsx, which already query the profile to render
  // anything meaningful. That's still fully server-enforced; it just runs
  // in the Server Component rather than here.
  const { pathname } = request.nextUrl;
  const isProtectedArea =
    pathname.startsWith("/founder") || pathname.startsWith("/investor");

  if (isProtectedArea && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // --- Signed-in home redirect ---
  // The marketing home page (`app/(marketing)/page.tsx`) already redirects
  // a signed-in visitor to their app itself, via
  // `getCurrentUserProfile()` + `roleHomePath()`. But that check runs
  // inside an async Server Component, and that route has a
  // `loading.tsx`, so Next paints the marketing layout (header + footer)
  // and the loading skeleton immediately, then redirects once the check
  // resolves - a visible flash of the marketing chrome, then a second
  // flash of the destination layout's own nav, before the real page
  // shows. Doing it here instead means the redirect happens before any
  // HTML is sent, so neither flash occurs.
  //
  // `role` is read from the JWT's `user_metadata` (set once at signup by
  // `handle_new_user()`, see the Sprint 1 migration, and never mutated
  // afterwards) rather than a `profiles` query, to keep this check as
  // cheap as the route-protection one above. This is only ever used to
  // pick a redirect destination, never to gate access - the page-level
  // check above (backed by the real `profiles.role` column) still
  // decides what a founder vs. investor can actually see.
  if (pathname === "/" && user) {
    const role = user.user_metadata?.role as UserRole | undefined;
    if (role === "founder" || role === "investor") {
      return NextResponse.redirect(new URL(roleHomePath(role), request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Run on everything except static assets and image optimization
     * files, so the session cookie stays fresh on real navigations
     * without doing unnecessary work on every asset request.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
