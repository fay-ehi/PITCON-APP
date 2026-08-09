import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUserProfile } from "@/lib/auth/session";
import { getFounderProfileDetail } from "@/lib/queries/profile";
import { Container } from "@/components/shared/container";
import { FounderProfileForm } from "@/app/founder/profile/edit/founder-profile-form";

export const metadata: Metadata = {
  title: "Edit Profile",
};

export default async function EditFounderProfilePage() {
  const current = await getCurrentUserProfile();
  if (!current) redirect("/login?next=/founder/profile/edit");

  const profile = await getFounderProfileDetail(current.userId);
  if (!profile) redirect("/founder");

  return (
    <Container className="max-w-2xl py-12">
      <div className="mb-8">
        <h1 className="text-h3 text-gray-900">Edit profile</h1>
        <p className="text-small mt-2 text-gray-500">
          This is your professional identity as a founder - not your startup,
          that&apos;s a separate profile coming in a later sprint.
        </p>
      </div>
      <FounderProfileForm profile={profile} />
    </Container>
  );
}
