"use server";

import { createClient } from "@/lib/supabase/server";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import { roleHomePath } from "@/lib/auth/session";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

export type LoginActionResult =
  | { success: false; error: string }
  | { success: true; redirectTo: string };

function isSafeRelativePath(value: string | undefined): value is string {
  return !!value && value.startsWith("/") && !value.startsWith("//");
}

/**
 * Authenticates the user and reports back where they should go next.
 *
 * Deliberately does NOT call `redirect()` here. This action is invoked
 * imperatively from the login form's onSubmit handler (not bound to a
 * <form action={...}>), and a `redirect()` thrown from a Server Action in
 * that calling shape isn't guaranteed to be caught by Next's client
 * runtime: it can surface as a silent unhandled rejection instead of an
 * actual navigation. Returning the target path and letting the client
 * call `router.push()` is unambiguous.
 */
export async function loginAction(
  input: LoginInput,
  next?: string,
): Promise<LoginActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Check the form and try again." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(
    parsed.data,
  );

  if (error) {
    return { success: false, error: getAuthErrorMessage(error) };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (!profile) {
    // Shouldn't happen: every auth user gets a profile via the signup
    // trigger, but fail safely rather than send them somewhere broken.
    return { success: false, error: "Something went wrong. Please try again." };
  }

  // `next` (e.g. "?next=/founder/settings" from proxy.ts bouncing a
  // signed-out visitor to login) is honored when it's a safe same-site
  // path. If it points at the wrong role's area, that area's own layout
  // will bounce them again to their real home, this is just a
  // convenience, not the security boundary.
  return {
    success: true,
    redirectTo: isSafeRelativePath(next) ? next : roleHomePath(profile.role),
  };
}
