import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Briefcase, Globe, MapPin, Rocket } from "lucide-react";

import { getCurrentUserProfile } from "@/lib/auth/session";
import { getFounderProfileDetail } from "@/lib/queries/profile";
import { calculateFounderProfileCompletion } from "@/lib/profile/completion";
import { Container } from "@/components/shared/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileField } from "@/components/profile/profile-field";

export const metadata: Metadata = {
  title: "Your Profile",
};

export default async function FounderProfilePage() {
  const current = await getCurrentUserProfile();
  if (!current) redirect("/login?next=/founder/profile");

  const profile = await getFounderProfileDetail(current.userId);
  if (!profile) redirect("/founder/startups");

  const completion = calculateFounderProfileCompletion({
    avatarUrl: profile.avatarUrl,
    jobTitle: profile.jobTitle,
    country: profile.country,
    bio: profile.bio,
    websiteUrl: profile.websiteUrl,
  });

  return (
    <Container className="max-w-4xl py-10 sm:py-12">
      <ProfileHeader
        name={profile.fullName}
        avatarUrl={profile.avatarUrl}
        subtitle={profile.jobTitle}
        roleLabel="Founder"
        editHref="/founder/profile/edit"
        completion={completion}
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

          <Card className="relative overflow-hidden">
            <div aria-hidden className="bg-accent-amber absolute top-0 left-0 h-1.5 w-full" />
            <CardContent className="flex flex-col items-start gap-3 pt-1">
              <span className="bg-accent-amber-soft flex size-11 items-center justify-center rounded-full">
                <Rocket className="text-accent-amber-soft-fg size-5" aria-hidden />
              </span>
              <div>
                <p className="text-body font-semibold text-gray-900">Your startup</p>
                <p className="text-small mt-0.5 text-gray-500">
                  This page is your personal identity, separate from the business
                  you&apos;re building.
                </p>
              </div>
              <Button asChild variant="secondary" size="sm">
                <Link href="/founder/startups">Go to My Startups</Link>
              </Button>
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
        </div>
      </div>
    </Container>
  );
}
