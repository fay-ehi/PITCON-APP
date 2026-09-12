import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { fetchWithTimeout } from "@/lib/supabase/fetch-with-timeout";

/**
 * Next.js 16 renamed `middleware.ts` -> `proxy.ts` (exported function must
 * be named `proxy`). This runs on every request matched below.
 *
 * Two responsibilities: refresh the Supabase auth session/cookies on
 * every request, and redirect signed-out visitors away from every
 * `/founder` and `/investor` route (see "Route protection" below). It
 * does NOT redirect signed-in users away from auth pages — that's each
 * auth page's own `getCurrentUserProfile()` + `roleHomePath()` check
 * (see app/(auth)/login/page.tsx and friends), and it does NOT check
 * founder-vs-investor role - see the note on that below.
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
