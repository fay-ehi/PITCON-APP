import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

/** Postgres's code for a unique-constraint violation - here,
 * `startup_views_startup_investor_day_key` (the Sprint 12 migration).
 * Reopening the same startup's preview more than once in a day should
 * silently no-op, not surface as an error - there's no error to show
 * the investor anyway, since this never blocks their own page load. */
const POSTGRES_UNIQUE_VIOLATION = "23505";

/**
 * Logs one Founder Analytics view event - best-effort, and deliberately
 * takes an already-created `supabase` client rather than creating its
 * own via `createClient()` internally, the way every other file in
 * `lib/queries`/`lib/*-actions.ts` does.
 *
 * The reason is Next.js 16's `after()`: this is meant to be called
 * from `after()` in app/investor/discover/page.tsx, a Server
 * Component, so the actual `.insert()` network call doesn't block that
 * page's response. But per node_modules/next/dist/docs/.../after.md,
 * calling `cookies()`/`headers()` *inside* an `after()` callback in a
 * Server Component throws at runtime - and `createClient()` calls
 * `cookies()` internally. The docs' own recommended fix is "read
 * request data beforehand and pass the values in," which is exactly
 * what taking a pre-built `supabase` client here does: the caller
 * creates it during normal render (before `after()` runs), and only
 * the deferred `.insert()` call itself happens inside the callback.
 *
 * Never throws - a failed view log should never surface to the
 * investor or affect their own experience of viewing the startup, the
 * same reasoning as `sendInterestReceivedEmail`'s best-effort emails.
 */
export async function logStartupView(
  supabase: SupabaseClient<Database>,
  startupId: string,
  investorId: string,
): Promise<void> {
  const { error } = await supabase
    .from("startup_views")
    .insert({ startup_id: startupId, investor_id: investorId });

  if (error && error.code !== POSTGRES_UNIQUE_VIOLATION) {
    console.error(
      `[analytics] Failed to log view of startup ${startupId} by investor ${investorId}:`,
      error.message,
    );
  }
}
