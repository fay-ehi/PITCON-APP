import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUserProfile } from "@/lib/auth/session";
import {
  getIndustries,
  getInvestorPreferenceIds,
  getInvestorProfileDetail,
  getStartupStages,
} from "@/lib/queries/profile";
import { Container } from "@/components/shared/container";
import { InvestorProfileForm } from "@/app/investor/profile/edit/investor-profile-form";
import { InvestorPreferencesForm } from "@/app/investor/profile/edit/investor-preferences-form";

export const metadata: Metadata = {
  title: "Set Up Your Profile",
};

/**
 * First-run setup for an investor. Reuses `InvestorProfileForm` and
 * `InvestorPreferencesForm` as-is, same rationale as the founder
 * onboarding page - identical fields, different framing and a
 * `redirectTo` of `/investor` on the identity form's save.
 *
 * The preferences form always redirects/refreshes in place rather than
 * navigating away (see its own component), so here it's just placed
 * below the identity form; finishing the identity form is what moves
 * the investor on to their dashboard, preferences can be filled in
 * either now or later from Edit Profile - see the Sprint 2 brief on not
 * forcing optional information.
 */
export default async function InvestorOnboardingPage() {
  const current = await getCurrentUserProfile();
  if (!current) redirect("/login?next=/investor/onboarding");

  const [profile, industries, stages, preferenceIds] = await Promise.all([
    getInvestorProfileDetail(current.userId),
    getIndustries(),
    getStartupStages(),
    getInvestorPreferenceIds(current.userId),
  ]);

  if (!profile) redirect("/investor");

  return (
    <Container className="max-w-2xl py-12">
      <div className="mb-8">
        <h1 className="text-h2 text-gray-900">Set up your investor profile</h1>
        <p className="text-body mt-2 text-gray-500">
          Tell founders who you are and what you look for. It only takes a
          minute - you can always refine it later from Edit Profile.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <InvestorProfileForm
          profile={profile}
          submitLabel="Continue"
          redirectTo="/investor"
          successMessage="Your investor profile is ready."
        />
        <InvestorPreferencesForm
          industries={industries}
          stages={stages}
          initialIndustryIds={preferenceIds.industryIds}
          initialStageIds={preferenceIds.stageIds}
          initialFundingRangeMin={profile.fundingRangeMin}
          initialFundingRangeMax={profile.fundingRangeMax}
        />
      </div>

      <p className="text-caption mt-6 text-center text-gray-400">
        You can skip this for now and{" "}
        <Link href="/investor" className="text-primary hover:underline">
          go straight to your dashboard
        </Link>
        .
      </p>
    </Container>
  );
}
