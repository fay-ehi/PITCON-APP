import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUserProfile } from "@/lib/auth/session";
import { getFounderProfileDetail } from "@/lib/queries/profile";
import { calculateFounderProfileCompletion } from "@/lib/profile/completion";
import { Container } from "@/components/shared/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileField } from "@/components/profile/profile-field";
import { ProfileCompletionBar } from "@/components/profile/profile-completion-bar";

export const metadata: Metadata = {
  title: "Your Profile",
};

export default async function FounderProfilePage() {
  const current = await getCurrentUserProfile();
  if (!current) redirect("/login?next=/founder/profile");

  const profile = await getFounderProfileDetail(current.userId);
  if (!profile) redirect("/founder");

  const completion = calculateFounderProfileCompletion({
    avatarUrl: profile.avatarUrl,
    jobTitle: profile.jobTitle,
    country: profile.country,
    bio: profile.bio,
    websiteUrl: profile.websiteUrl,
  });

  return (
    <Container className="max-w-2xl py-12">
      <div className="flex items-start justify-between gap-4">
        <ProfileHeader
          name={profile.fullName}
          avatarUrl={profile.avatarUrl}
          subtitle={profile.jobTitle}
        />
        <Button asChild variant="secondary" size="sm" className="shrink-0">
          <Link href="/founder/profile/edit">Edit profile</Link>
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
            <ProfileField label="Job title" value={profile.jobTitle} />
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

        <Card className="border-dashed bg-gray-50">
          <CardContent className="text-small text-gray-500">
            Your startup profile isn&apos;t part of this yet - that&apos;s
            coming in a later sprint. This page is your personal founder
            identity, separate from the business you&apos;re building.
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
