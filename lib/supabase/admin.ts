import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

/**
 * Service-role Supabase client - bypasses RLS entirely, using
 * `SUPABASE_SECRET_KEY` instead of the publishable key. This is the
 * first thing in the codebase to actually use that key (see its
 * `.env.example` comment: "not used by any Sprint 0 code yet").
 *
 * Only for server-only code with a legitimate reason to read or act
 * across every user's data - today that's exactly two things:
 *   1. Looking up a recipient's email address to send a transactional
 *      notification (`auth.users.email` isn't exposed through
 *      `public.profiles` or any RLS policy, by design)
 *   2. The admin view's cross-user queries (recent signups, recent
 *      interests) - a real user's RLS session can only ever see their
 *      own data, which is exactly wrong for that page
 *
 * Never import this into anything reachable from a Client Component,
 * and never reach for it as a shortcut around a real RLS-scoped query -
 * `lib/supabase/server.ts` is what every normal Server
 * Component/Action/Route Handler should use.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      "createAdminClient() requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY " +
        "to be set - see .env.example.",
    );
  }

  return createSupabaseClient<Database>(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
