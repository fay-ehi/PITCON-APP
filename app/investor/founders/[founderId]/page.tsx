import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Briefcase, Globe, MapPin } from "lucide-react";

import { getFounderProfileDetail } from "@/lib/queries/profile";
import { getFounderEngagementSummaryByIdAction } from "@/lib/reputation/reputation-actions";
import { Container } from "@/components/shared/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileField } from "@/components/profile/profile-field";
import { EngagementStatsLoader } from "@/components/shared/engagement-stats-loader";
import { ReportButton } from "@/components/shared/report-button";

export const metadata: Metadata = {
  title: "Founder Profile",
};

/**
 * The investor-facing twin of `app/investor/founders/[founderId]/page.tsx`'s
 * sibling, `/founder/investors/[investorId]` - same reasoning, mirrored:
 * `getFounderProfileDetail` is the exact function the Founder's own
 * self-view page already calls, just now with someone else's id. RLS
 * (Sprint 13's "Investors can read founder profiles for published
 * startups") is what actually decides whether a given investor can see a
 * given founder - a founder with no published startup simply isn't
 * visible here, same `null` -> `notFound()` treatment as the investor
 * side, so a random id can't be used to confirm whether an account
 * exists.
 *
 * Not linked from anywhere yet - see the end-of-task note on why the
 * Founder section of Discover's preview dialog doesn't show a founder
 * avatar/name today (a deliberate `StartupDetail` design choice, not an
 * oversight), and the admin verification queue, which links here
 * directly instead.
 */
export default async function FounderPublicProfilePage({
  params,
}: {
  params: Promise<{ founderId: string }>;
}) {
  const { founderId } = await params;

  const profile = await getFounderProfileDetail(founderId);
  if (!profile) notFound();

  return (
    <Container className="max-w-4xl py-10 sm:py-12">
      <ProfileHeader
        name={profile.fullName}
        avatarUrl={profile.avatarUrl}
        subtitle={profile.jobTitle}
        roleLabel="Founder"
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
              <ProfileField icon={Briefcase} label="Job title" value={profile.jobTitle} />
              <ProfileField icon={MapPin} label="Country" value={profile.country} />
              <ProfileField
                icon={Globe}
                label="LinkedIn / Website / Portfolio"
                value={
                  profile.websiteUrl ? (
                    <a
                      href={profile.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {profile.websiteUrl}
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
            <CardContent className="flex flex-col gap-3">
              <EngagementStatsLoader
                key={founderId}
                action={getFounderEngagementSummaryByIdAction}
                id={founderId}
              />
              <ReportButton
                label="Report this founder"
                reportedUserId={founderId}
                className="w-fit"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}
