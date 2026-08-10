import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUserProfile } from "@/lib/auth/session";
import { getIndustries, getStartupStages } from "@/lib/queries/profile";
import { getStartupById } from "@/lib/queries/startup";
import { Container } from "@/components/shared/container";
import { StartupForm } from "./startup-form";

export const metadata: Metadata = {
  title: "Edit Startup",
};

/**
 * The Sprint 3 create/edit flow, addressed by `startupId` - the
 * destination for both "+ Add Startup" (via `createDraftStartupAction`,
 * which creates the row and redirects here) and every "Edit
 * startup"/"Continue editing" link on the My Startups grid. Per the
 * Sprint 4 brief, this is deliberately the *same* flow for every
 * startup a founder has, not a separate creation system.
 *
 * An unknown or not-owned `startupId` sends the founder back to My
 * Startups - see the matching comment on the view page.
 */
export default async function EditStartupPage({
  params,
}: {
  params: Promise<{ startupId: string }>;
}) {
  const { startupId } = await params;
  const current = await getCurrentUserProfile();
  if (!current) redirect(`/login?next=/founder/startups/${startupId}/edit`);

  const [startup, industries, stages] = await Promise.all([
    getStartupById(startupId, current.userId),
    getIndustries(),
    getStartupStages(),
  ]);

  if (!startup) redirect("/founder/startups");

  const isBlankDraft = startup.status === "draft" && !startup.name;

  return (
    <Container className="max-w-4xl py-12">
      <div className="mb-8">
        <h1 className="text-h3 text-gray-900">
          {isBlankDraft ? "Create your startup" : "Edit startup"}
        </h1>
        <p className="text-small mt-2 text-gray-500">
          Tell investors what you&apos;re building and what you&apos;re looking
          for. You can save a draft any time and come back later.
        </p>
      </div>
      <StartupForm startup={startup} industries={industries} stages={stages} />
    </Container>
  );
}
