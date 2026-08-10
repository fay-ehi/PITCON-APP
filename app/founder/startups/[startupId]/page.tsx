import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUserProfile } from "@/lib/auth/session";
import { getPitchDeckSignedUrl, getStartupById } from "@/lib/queries/startup";
import { calculateStartupCompletion } from "@/lib/startup/completion";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { StartupStatusBadge } from "@/components/startup/startup-status-badge";
import { StartupPreview } from "@/components/startup/startup-preview";
import { ProfileCompletionBar } from "@/components/profile/profile-completion-bar";

export const metadata: Metadata = {
  title: "Startup",
};

/**
 * Read-only view of one startup, by id - the "View startup →" / "View
 * Startup" destination from a My Startups card. Same
 * `StartupPreview` used since Sprint 3, just now addressed by
 * `startupId` instead of being the founder's one implicit startup.
 *
 * An unknown or not-owned `startupId` sends the founder back to My
 * Startups rather than a bare 404 - keeps them inside the app shell
 * instead of dropping them onto a chrome-less not-found page, and
 * mirrors `getStartupById`'s "wrong owner looks identical to
 * nonexistent" behavior.
 */
export default async function StartupViewPage({
  params,
}: {
  params: Promise<{ startupId: string }>;
}) {
  const { startupId } = await params;
  const current = await getCurrentUserProfile();
  if (!current) redirect(`/login?next=/founder/startups/${startupId}`);

  const startup = await getStartupById(startupId, current.userId);
  if (!startup) redirect("/founder/startups");

  const completion = calculateStartupCompletion(startup);
  const pitchDeckUrl = startup.pitchDeckPath
    ? await getPitchDeckSignedUrl(startup.pitchDeckPath)
    : null;

  return (
    <Container className="max-w-2xl py-12">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-h3 font-semibold text-gray-900">
            {startup.name || "Your startup"}
          </h1>
          <StartupStatusBadge status={startup.status} />
        </div>
        <Button asChild variant="secondary" size="sm" className="shrink-0">
          <Link href={`/founder/startups/${startup.id}/edit`}>
            Edit startup
          </Link>
        </Button>
      </div>

      {completion < 100 && (
        <ProfileCompletionBar
          percentage={completion}
          label="Startup completion"
          className="mt-6"
        />
      )}

      <div className="mt-8">
        <StartupPreview startup={startup} pitchDeckUrl={pitchDeckUrl} />
      </div>
    </Container>
  );
}
