import type { Metadata } from "next";
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
  title: "Edit Profile",
};

export default async function EditInvestorProfilePage() {
  const current = await getCurrentUserProfile();
  if (!current) redirect("/login?next=/investor/profile/edit");

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
        <h1 className="text-h3 text-gray-900">Edit profile</h1>
        <p className="text-small mt-2 text-gray-500">
          Keep your investor identity and preferences up to date.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <InvestorProfileForm profile={profile} />
        <InvestorPreferencesForm
          industries={industries}
          stages={stages}
          initialIndustryIds={preferenceIds.industryIds}
          initialStageIds={preferenceIds.stageIds}
          initialFundingRangeMin={profile.fundingRangeMin}
          initialFundingRangeMax={profile.fundingRangeMax}
        />
      </div>
    </Container>
  );
}
