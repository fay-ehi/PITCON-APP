import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Building2, Globe, Landmark, MapPin, Wallet } from "lucide-react";

import { getCurrentUserProfile } from "@/lib/auth/session";
import { getInvestorProfileDetail } from "@/lib/queries/profile";
import { calculateInvestorProfileCompletion } from "@/lib/profile/completion";
import { investorTypeLabel } from "@/constants/investor-types";
import { Container } from "@/components/shared/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileField } from "@/components/profile/profile-field";
import { getIndustryAccent } from "@/lib/startup/industry-accent";

export const metadata: Metadata = {
  title: "Your Profile",
};

function formatUsd(amount: number | null): string | null {
  if (amount === null) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function InvestorProfilePage() {
  const current = await getCurrentUserProfile();
  if (!current) redirect("/login?next=/investor/profile");

  const profile = await getInvestorProfileDetail(current.userId);
  if (!profile) redirect("/investor");

  const completion = calculateInvestorProfileCompletion({
    avatarUrl: profile.avatarUrl,
    organization: profile.organization,
    country: profile.country,
    investorType: profile.investorType,
    bio: profile.bio,
    linkedinUrl: profile.linkedinUrl,
    industryPreferenceCount: profile.industries.length,
    stagePreferenceCount: profile.stages.length,
  });

  const fundingRangeLabel =
    profile.fundingRangeMin !== null || profile.fundingRangeMax !== null
      ? `${formatUsd(profile.fundingRangeMin) ?? "Any"} \u2013 ${
          formatUsd(profile.fundingRangeMax) ?? "Any"
        }`
      : null;

  return (
    <Container className="max-w-4xl py-10 sm:py-12">
      <ProfileHeader
        name={profile.fullName}
        avatarUrl={profile.avatarUrl}
        subtitle={profile.organization}
        roleLabel="Investor"
        editHref="/investor/profile/edit"
        completion={completion}
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>At a glance</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <ProfileField icon={Building2} label="Organization" value={profile.organization} />
              <ProfileField
                icon={Landmark}
                label="Investor type"
                value={investorTypeLabel(profile.investorType)}
              />
              <ProfileField icon={MapPin} label="Country" value={profile.country} />
              <ProfileField icon={Wallet} label="Funding range" value={fundingRangeLabel} />
              <ProfileField
                icon={Globe}
                label="LinkedIn"
                value={
                  profile.linkedinUrl ? (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {profile.linkedinUrl}
                    </a>
                  ) : null
                }
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileField label="Bio" value={profile.bio} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Investment preferences</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <span className="text-caption font-medium text-gray-500">Industries</span>
                {profile.industries.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.industries.map((industry) => {
                      const accent = getIndustryAccent(industry.slug);
                      return (
                        <span
                          key={industry.id}
                          className={`text-caption inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium ${accent.softBg} ${accent.softText}`}
                        >
                          <accent.icon className="size-3" aria-hidden />
                          {industry.name}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-body text-gray-400 italic">Not added yet</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-caption font-medium text-gray-500">Startup stages</span>
                {profile.stages.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.stages.map((stage) => (
                      <span
                        key={stage.id}
                        className="text-caption bg-primary-50 text-primary-700 inline-flex items-center rounded-full px-2.5 py-1 font-medium"
                      >
                        {stage.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-body text-gray-400 italic">Not added yet</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}
