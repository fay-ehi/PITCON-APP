import type { Metadata } from "next";
import Link from "next/link";

import { getCurrentUserProfile } from "@/lib/auth/session";
import { getInvestorProfileDetail } from "@/lib/queries/profile";
import { calculateInvestorProfileCompletion } from "@/lib/profile/completion";
import { Container } from "@/components/shared/container";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileCompletionBar } from "@/components/profile/profile-completion-bar";

export const metadata: Metadata = {
  title: "Investor",
};

/**
 * Placeholder only: the real investor discovery experience is a later
 * sprint. See app/founder/page.tsx for the mirrored rationale, including
 * the profile-completion nudge added this sprint.
 */
export default async function InvestorHomePage() {
  const current = await getCurrentUserProfile();

  const profile = current
    ? await getInvestorProfileDetail(current.userId)
    : null;
  const completion = profile
    ? calculateInvestorProfileCompletion({
        avatarUrl: profile.avatarUrl,
        organization: profile.organization,
        country: profile.country,
        investorType: profile.investorType,
        bio: profile.bio,
        linkedinUrl: profile.linkedinUrl,
        industryPreferenceCount: profile.industries.length,
        stagePreferenceCount: profile.stages.length,
      })
    : 0;

  return (
    <Container className="py-16">
      <h1 className="text-h1 text-gray-900">
        Welcome, {current?.profile.full_name.split(" ")[0]}.
      </h1>
      <p className="text-body mt-3 max-w-lg text-gray-500">
        You&apos;re signed in as an investor. Startup discovery, search, and
        bookmarks are on the way in a later sprint.
      </p>

      {profile && completion < 100 && (
        <Card className="mt-8 max-w-lg">
          <CardContent className="flex flex-col gap-4">
            <div>
              <h2 className="text-h3 font-semibold text-gray-900">
                Finish setting up your profile
              </h2>
              <p className="text-small mt-1 text-gray-500">
                Add your investment preferences so you&apos;re ready for
                Discover as soon as it ships.
              </p>
            </div>
            <ProfileCompletionBar percentage={completion} />
            <Button asChild className="self-start">
              <Link href="/investor/onboarding">Complete profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
