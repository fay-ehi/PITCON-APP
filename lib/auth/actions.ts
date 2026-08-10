"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth";

/**
 * Signs the current user out and returns them to login. Bound directly to
 * a <form action={signOutAction}> so it works with zero client JS. No
 * need for a client component just to fire a click handler.
 */
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export type UpdateAccountPasswordResult =
  { success: false; error: string } | { success: true };

/**
 * Sets a new password from within the Founder Settings workspace
 * (Sprint 4's Account section). Reuses the same `resetPasswordSchema`
 * as the signed-out "forgot password" flow's `updatePasswordAction`
 * (app/(auth)/reset-password/actions.ts) - same password rules either
 * way - but deliberately does NOT sign the user out afterward: that flow
 * ends a one-time recovery-link session on purpose, whereas this one is
 * a founder mid-session changing their own password and should stay
 * signed in, same as any other settings save.
 */
export async function updateAccountPasswordAction(
  input: ResetPasswordInput,
): Promise<UpdateAccountPasswordResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Check the form and try again." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You need to be signed in to do that." };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, error: getAuthErrorMessage(error) };
  }

  return { success: true };
}
