"use server";

import { createClient } from "@/lib/supabase/server";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth";

export type ResetPasswordActionResult =
  | { success: false; error: string }
  | { success: true; redirectTo: string };

/**
 * Sets a new password for the account tied to the current (recovery)
 * session. Requires that session to already exist, established by
 * /auth/confirm's verifyOtp(type: 'recovery') call when the user clicked
 * the reset link, so there's no token to pass here.
 *
 * After a successful update, the recovery session is deliberately signed
 * out and the user sent to /login: per the product flow (Forgot Password
 * -> ... -> Password Updated -> Login), and as good practice not to leave
 * a session active off the back of a reset-link click after a credential
 * change.
 *
 * Returns the /login destination rather than calling `redirect()`
 * directly, since this action is invoked imperatively from the form's
 * onSubmit handler, not bound to a <form action={...}>, see the
 * loginAction/signUpAction comments for why that distinction matters.
 */
export async function updatePasswordAction(
  input: ResetPasswordInput,
): Promise<ResetPasswordActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Check the form and try again." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, error: getAuthErrorMessage(error) };
  }

  await supabase.auth.signOut();
  return { success: true, redirectTo: "/login?passwordUpdated=1" };
}
