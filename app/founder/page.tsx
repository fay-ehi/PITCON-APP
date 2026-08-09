import type { Metadata } from "next";
import Link from "next/link";

import { getCurrentUserProfile } from "@/lib/auth/session";
import { getFounderProfileDetail } from "@/lib/queries/profile";
import { calculateFounderProfileCompletion } from "@/lib/profile/completion";
import { Container } from "@/components/shared/container";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileCompletionBar } from "@/components/profile/profile-completion-bar";

export const metadata: Metadata = {
  title: "Founder",
};

/**
 * Placeholder only: the real founder dashboard (Screen 6 in the Design
 * System doc) is a later sprint. This exists to prove the auth + role
 * protection architecture end to end: signed-out visitors and signed-in
 * investors can't reach this page (see app/founder/layout.tsx and
 * proxy.ts), and a signed-in founder lands here right after signup or
 * login.
 *
 * The one addition this sprint: a profile-completion nudge, since
 * profiles now exist to be nudged about. Not a hard redirect into
 * onboarding - see the Sprint 2 brief on not forcing optional steps.
 */
export default async function FounderHomePage() {
  const current = await getCurrentUserProfile();

  const profile = current
    ? await getFounderProfileDetail(current.userId)
    : null;
  const completion = profile
    ? calculateFounderProfileCompletion({
        avatarUrl: profile.avatarUrl,
        jobTitle: profile.jobTitle,
        country: profile.country,
        bio: profile.bio,
        websiteUrl: profile.websiteUrl,
      })
    : 0;

  return (
    <Container className="py-16">
      <h1 className="text-h1 text-gray-900">
        Welcome, {current?.profile.full_name.split(" ")[0]}.
      </h1>
      <p className="text-body mt-3 max-w-lg text-gray-500">
        You&apos;re signed in as a founder. Your dashboard, startup profile,
        investor interest, and messaging, is on the way in a later sprint.
      </p>

      {profile && completion < 100 && (
        <Card className="mt-8 max-w-lg">
          <CardContent className="flex flex-col gap-4">
            <div>
              <h2 className="text-h3 font-semibold text-gray-900">
                Finish setting up your profile
              </h2>
              <p className="text-small mt-1 text-gray-500">
                A complete profile helps investors get to know you once your
                startup is live.
              </p>
            </div>
            <ProfileCompletionBar percentage={completion} />
            <Button asChild className="self-start">
              <Link href="/founder/onboarding">Complete profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
