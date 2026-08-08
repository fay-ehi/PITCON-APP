"use server";

import { createClient } from "@/lib/supabase/server";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import { getSiteURL } from "@/lib/site-url";
import { roleHomePath } from "@/lib/auth/session";
import { signUpSchema, type SignUpInput } from "@/lib/validations/auth";

export type SignUpActionResult =
  | {
      success: false;
      error: string;
      /** Which field the error applies to, if any, lets the form surface
       * it next to the right input instead of only as a banner. */
      field?: "email" | "password" | "fullName" | "role";
    }
  | { success: true; redirectTo: string };

/**
 * Creates a PITCON account. `role` is decided at signup and passed as
 * user metadata so `handle_new_user()` (the DB trigger) can create the
 * matching `profiles` + `founder_profiles`/`investor_profiles` rows
 * atomically with the auth account, see the Sprint 1 migration.
 *
 * Returns the verify-email destination on success rather than calling
 * `redirect()` directly. This action is invoked imperatively from the
 * signup form's onSubmit handler (not bound to a <form action={...}>),
 * and `redirect()` thrown from a Server Action in that calling shape
 * isn't reliably caught by Next's client runtime as an actual
 * navigation. Returning the path and calling `router.push()` client-side
 * is unambiguous.
 */
export async function signUpAction(
  input: SignUpInput,
): Promise<SignUpActionResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Check the form and try again." };
  }

  const { fullName, email, password, role } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role },
      // Sent straight to the role-specific area once the confirmation
      // link is clicked, see app/auth/confirm/route.ts.
      emailRedirectTo: `${getSiteURL()}${roleHomePath(role)}`,
    },
  });

  if (error) {
    return { success: false, error: getAuthErrorMessage(error) };
  }

  // Supabase doesn't return an error for signing up with an email that
  // already belongs to a confirmed account (this avoids leaking which
  // emails are registered): instead the returned user has no identities.
  // Sprint 1 explicitly calls for a distinguishable "email already
  // registered" error, so we surface it here rather than showing a false
  // "check your email" success screen.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return {
      success: false,
      error: "An account with this email already exists. Try logging in instead.",
      field: "email",
    };
  }

  return {
    success: true,
    redirectTo: `/verify-email?email=${encodeURIComponent(email)}`,
  };
}
