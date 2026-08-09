import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUserProfile } from "@/lib/auth/session";
import { getInvestorProfileDetail } from "@/lib/queries/profile";
import { calculateInvestorProfileCompletion } from "@/lib/profile/completion";
import { investorTypeLabel } from "@/constants/investor-types";
import { Container } from "@/components/shared/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileField } from "@/components/profile/profile-field";
import { ProfileCompletionBar } from "@/components/profile/profile-completion-bar";

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
      ? `${formatUsd(profile.fundingRangeMin) ?? "Any"} – ${
          formatUsd(profile.fundingRangeMax) ?? "Any"
        }`
      : null;

  return (
    <Container className="max-w-2xl py-12">
      <div className="flex items-start justify-between gap-4">
        <ProfileHeader
          name={profile.fullName}
          avatarUrl={profile.avatarUrl}
          subtitle={profile.organization}
        />
        <Button asChild variant="secondary" size="sm" className="shrink-0">
          <Link href="/investor/profile/edit">Edit profile</Link>
        </Button>
      </div>

      {completion < 100 && (
        <ProfileCompletionBar percentage={completion} className="mt-6" />
      )}

      <div className="mt-8 flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Professional information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <ProfileField label="Organization" value={profile.organization} />
            <ProfileField
              label="Investor type"
              value={investorTypeLabel(profile.investorType)}
            />
            <ProfileField label="Country" value={profile.country} />
            <ProfileField
              label="Bio"
              value={profile.bio}
              className="sm:col-span-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Links</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileField
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

        <Card>
          <CardHeader>
            <CardTitle>Investment preferences</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <span className="text-caption font-medium text-gray-500">
                Industries
              </span>
              {profile.industries.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.industries.map((industry) => (
                    <Badge key={industry.id} variant="primary">
                      {industry.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-body text-gray-400 italic">
                  Not added yet
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-caption font-medium text-gray-500">
                Startup stages
              </span>
              {profile.stages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.stages.map((stage) => (
                    <Badge key={stage.id} variant="secondary">
                      {stage.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-body text-gray-400 italic">
                  Not added yet
                </span>
              )}
            </div>

            <ProfileField label="Funding range" value={fundingRangeLabel} />
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
