import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database.types";
import { fetchWithTimeout } from "@/lib/supabase/fetch-with-timeout";

/**
 * Supabase client for use in Client Components. Reads the public,
 * client-safe env vars only — never the secret key.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      // See lib/supabase/fetch-with-timeout.ts — bounds each auth/DB
      // fetch so a bad connection fails fast (8s) instead of hanging
      // login/signup/data calls indefinitely in the browser.
      global: { fetch: fetchWithTimeout(8000) },
    },
  );
}
