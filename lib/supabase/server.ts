import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/types/database.types";

/**
 * Supabase client for use in Server Components, Server Actions, and
 * Route Handlers. Must be created fresh per request (not module-level
 * singleton) since it reads the request's cookies.
 *
 * Server Components can't write cookies, so `setAll` is wrapped in a
 * try/catch — writes there are expected to no-op as long as the session
 * is also refreshed in `proxy.ts`.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — safe to ignore because
            // proxy.ts refreshes the session on every request.
          }
        },
      },
    },
  );
}
