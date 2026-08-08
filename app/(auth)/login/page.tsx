import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUserProfile, roleHomePath } from "@/lib/auth/session";
import { LoginForm } from "@/app/(auth)/login/login-form";

export const metadata: Metadata = {
  title: "Log in",
};

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_link: "That link is invalid or has expired. Log in below.",
  expired_link:
    "That link has expired. Log in, or use \u201cForgot password\u201d to request a new one.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    next?: string;
    authError?: string;
    passwordUpdated?: string;
  }>;
}) {
  const { next, authError, passwordUpdated } = await searchParams;

  const current = await getCurrentUserProfile();
  if (current) redirect(roleHomePath(current.profile.role));

  const errorMessage = authError ? AUTH_ERROR_MESSAGES[authError] : undefined;
  const noticeMessage = passwordUpdated
    ? "Password updated. Log in with your new password."
    : undefined;

  return (
    <LoginForm
      next={next}
      initialError={errorMessage}
      initialNotice={noticeMessage}
    />
  );
}
