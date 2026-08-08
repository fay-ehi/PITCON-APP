import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUserProfile, roleHomePath } from "@/lib/auth/session";
import { ForgotPasswordForm } from "@/app/(auth)/forgot-password/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ authError?: string }>;
}) {
  const { authError } = await searchParams;

  const current = await getCurrentUserProfile();
  if (current) redirect(roleHomePath(current.profile.role));

  const initialError =
    authError === "expired_link"
      ? "That reset link has expired. Request a new one below."
      : undefined;

  return <ForgotPasswordForm initialError={initialError} />;
}
