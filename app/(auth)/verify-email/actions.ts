"use server";

import { createClient } from "@/lib/supabase/server";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import { getSiteURL } from "@/lib/site-url";
import { forgotPasswordSchema } from "@/lib/validations/auth";

export type ResendActionResult = { error: string } | { success: true };

/**
 * Re-sends the signup confirmation email. Doesn't redirect to a specific
 * role area on the resend, since we don't know the role here without an
 * extra lookup: the original confirmation link (still valid until it
 * expires) already carries the correct destination. Site root is a safe,
 * generic fallback.
 */
export async function resendConfirmationAction(
  email: string,
): Promise<ResendActionResult> {
  const parsed = forgotPasswordSchema.safeParse({ email });
  if (!parsed.success) {
    return { error: "Enter a valid email address." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    options: {
      emailRedirectTo: getSiteURL(),
    },
  });

  if (error) {
    return { error: getAuthErrorMessage(error) };
  }

  return { success: true };
}
