import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUserProfile } from "@/lib/auth/session";
import { getFounderProfileDetail } from "@/lib/queries/profile";
import { Container } from "@/components/shared/container";
import { FounderProfileForm } from "@/app/founder/profile/edit/founder-profile-form";

export const metadata: Metadata = {
  title: "Set Up Your Profile",
};

/**
 * First-run setup for a founder, reusing the same form (and the same
 * `updateFounderProfileAction`) as `/founder/profile/edit` - the fields
 * collected are identical, this route just presents them as an
 * onboarding step with different framing and redirects to the dashboard
 * on success instead of back to the view page.
 *
 * Not gated/forced: nothing prevents a founder from going straight to
 * `/founder` and filling this in later from Edit Profile, per the
 * Sprint 2 brief ("do not force users to complete information that is
 * not required"). The skip link below makes that an explicit option
 * rather than a dead end.
 */
export default async function FounderOnboardingPage() {
  const current = await getCurrentUserProfile();
  if (!current) redirect("/login?next=/founder/onboarding");

  const profile = await getFounderProfileDetail(current.userId);
  if (!profile) redirect("/founder");

  return (
    <Container className="max-w-2xl py-12">
      <div className="mb-8">
        <h1 className="text-h2 text-gray-900">Set up your founder profile</h1>
        <p className="text-body mt-2 text-gray-500">
          This is how investors will get to know you once your startup is live.
          It only takes a minute - you can always refine it later from Edit
          Profile.
        </p>
      </div>

      <FounderProfileForm
        profile={profile}
        submitLabel="Finish"
        redirectTo="/founder"
        successMessage="Your founder profile is ready."
      />

      <p className="text-caption mt-6 text-center text-gray-400">
        You can skip this for now and{" "}
        <Link href="/founder" className="text-primary hover:underline">
          go straight to your dashboard
        </Link>
        .
      </p>
    </Container>
  );
}
