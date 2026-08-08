import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUserProfile, roleHomePath } from "@/lib/auth/session";
import { SignUpForm } from "@/app/(auth)/signup/signup-form";

export const metadata: Metadata = {
  title: "Create your account",
};

export default async function SignUpPage() {
  const current = await getCurrentUserProfile();
  if (current) redirect(roleHomePath(current.profile.role));

  return <SignUpForm />;
}
