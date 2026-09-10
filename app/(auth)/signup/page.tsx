import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUserProfile, roleHomePath } from "@/lib/auth/session";
import { roleSchema } from "@/lib/validations/auth";
import { SignUpForm } from "@/app/(auth)/signup/signup-form";

export const metadata: Metadata = {
  title: "Create your account",
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const current = await getCurrentUserProfile();
  if (current) redirect(roleHomePath(current.profile.role));

  // The landing page's "I'm a Founder" / "I'm an Investor" CTAs link
  // here with ?role=founder|investor so step 2 of the form already has
  // the right account type highlighted - carrying the visitor's choice
  // through rather than making them state it twice. Anything else
  // (missing, mistyped, tampered with) is silently ignored: the role
  // step still renders unselected, exactly as it did before this param
  // existed.
  const { role } = await searchParams;
  const parsedRole = roleSchema.safeParse(role);

  return <SignUpForm initialRole={parsedRole.success ? parsedRole.data : undefined} />;
}
