import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

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
  if (!profile) redirect("/founder/startups");

  return (
    <Container className="max-w-3xl py-10 sm:py-12">
      <div className="mb-8 flex items-center gap-3">
        <Link
          href="/founder/profile"
          aria-label="Back to profile"
          className="bg-primary-50 text-primary hover:bg-primary-100 flex size-9 shrink-0 items-center justify-center rounded-full transition-colors"
        >
          <ArrowLeft className="size-4" aria-hidden />
        </Link>
        <div>
          <h1 className="text-h4 text-gray-900">Back to profile</h1>
          
        </div>
      </div>
      <FounderProfileForm profile={profile} />
    </Container>
  );
}
