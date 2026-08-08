import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "@/app/(auth)/reset-password/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password",
};

export default async function ResetPasswordPage() {
  // Deliberately does NOT use the "already logged in -> bounce to role
  // area" redirect that the other auth pages use: reaching this page
  // via a valid recovery link means the user IS authenticated (that's
  // exactly the session /auth/confirm just established), and that's the
  // expected, required way to land here.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No session at all means this wasn't reached via a valid recovery
  // link (e.g. someone navigated here directly, or the link already
  // expired and /auth/confirm already redirected once): there's nothing
  // to reset against.
  if (!user) redirect("/forgot-password");

  return <ResetPasswordForm />;
}
