import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Building2, Globe, Landmark, MapPin, Wallet } from "lucide-react";

import { getInvestorProfileDetail } from "@/lib/queries/profile";
import { getInvestorEngagementSummaryAction } from "@/lib/reputation/reputation-actions";
import { investorTypeLabel } from "@/constants/investor-types";
import { Container } from "@/components/shared/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileField } from "@/components/profile/profile-field";
import { EngagementStatsLoader } from "@/components/shared/engagement-stats-loader";
import { ReportButton } from "@/components/shared/report-button";
import { getIndustryAccent } from "@/lib/startup/industry-accent";

export const metadata: Metadata = {
  title: "Investor Profile",
};

/** Same formatting convention as `formatUsd` in
 * app/investor/profile/page.tsx - kept local rather than shared, per
 * that file's own comment on why one small duplicated function beats
 * introducing a general-purpose utils file for it. */
function formatUsd(amount: number | null): string | null {
  if (amount === null) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * The "View profile" destination for an investor's avatar anywhere in
 * the Founder experience - Messages (conversation list + thread header)
 * and Interests (row + detail dialog). Deliberately the founder-facing
 * *twin* of `app/investor/profile/page.tsx`, not a stripped copy of it:
 * same fields, same card layout, minus the two things that only make
 * sense when the profile is your own (the completion pill, the "Edit
 * profile" button - see `ProfileHeader`'s `editHref: null` handling).
 *
 * `getInvestorProfileDetail` is the exact function the self-view page
 * already uses - it was never hardcoded to the signed-in session's own
 * id, just always called with it until now. RLS (Sprint 6's "Founders
 * can read investor profiles for their interests", extended by this
 * sprint's migration to cover the industry/stage preference tables too)
 * is what actually decides whether a given founder can see a given
 * investor: this page renders whatever comes back and treats `null` -
 * no such investor, or one this founder has no relationship with - as
 * not found. That's deliberate, same "wrong owner looks identical to
 * nonexistent" reasoning `getStartupById` already uses elsewhere in
 * this codebase, so a founder poking around investor ids at random
 * can't use this page to confirm one exists.
 */
export default async function InvestorPublicProfilePage({
  params,
}: {
  params: Promise<{ investorId: string }>;
}) {
  const { investorId } = await params;

  const profile = await getInvestorProfileDetail(investorId);
  if (!profile) notFound();

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
        editHref={null}
        verified={profile.verified}
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

          <Card>
            <CardContent className="flex flex-col gap-3">
              <EngagementStatsLoader
                key={investorId}
                action={getInvestorEngagementSummaryAction}
                id={investorId}
              />
              <ReportButton
                label="Report this investor"
                reportedUserId={investorId}
                className="w-fit"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}
