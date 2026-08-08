import { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { getSiteURL } from "@/lib/site-url";

/**
 * Handles both signup confirmation and password recovery links. Both of
 * PITCON's custom email templates (supabase/templates/confirmation.html,
 * recovery.html) point here rather than at Supabase's hosted verify
 * endpoint, so we control what happens after verification, in
 * particular, sending founders and investors straight to their own area
 * instead of a generic page.
 *
 * `token_hash` + `type` verification (rather than PKCE `code` exchange)
 * is Supabase's recommended approach for email-link flows: it works
 * regardless of which browser/device opens the link, since there's no
 * PKCE code verifier that has to match the one that started the flow.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const rawNext = searchParams.get("next");

  const siteURL = getSiteURL();
  // Only ever redirect back into this same site: `next` comes from a
  // query param on an incoming request, so it must be treated as
  // untrusted input even though we're the ones who put it there.
  const next =
    rawNext && rawNext.startsWith(siteURL) ? rawNext : `${siteURL}/`;

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      redirect(next);
    }
  }

  // Missing params, or verification failed (expired/already-used link):
  // send the user somewhere actionable rather than a dead end.
  if (type === "recovery") {
    redirect(`${siteURL}/forgot-password?authError=expired_link`);
  }
  redirect(`${siteURL}/login?authError=invalid_link`);
}
