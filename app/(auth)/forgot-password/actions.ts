"use server";

import { createClient } from "@/lib/supabase/server";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import { getSiteURL } from "@/lib/site-url";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";

export type ForgotPasswordActionResult =
  | { error: string }
  | { success: true };

export async function requestPasswordResetAction(
  input: ForgotPasswordInput,
): Promise<ForgotPasswordActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Enter a valid email address." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    { redirectTo: `${getSiteURL()}/reset-password` },
  );

  // Supabase deliberately doesn't report whether the email exists (so
  // this endpoint can't be used to enumerate accounts): the caller
  // always shows the same "check your email" message regardless.
  if (error) {
    return { error: getAuthErrorMessage(error) };
  }

  return { success: true };
}
