import Link from "next/link";
import { ArrowLeft, Building2, ExternalLink, FileText, Globe } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileField } from "@/components/profile/profile-field";
import { formatCount, formatLocation, formatUsd } from "@/lib/startup/format";
import type { StartupDetail } from "@/types/startup";

/**
 * The selected startup's in-page preview - the Sprint 5 brief's central
 * requirement ("CRITICAL: IN-PAGE STARTUP PREVIEW"). Renders the same
 * content on desktop and mobile; it's the surrounding layout
 * (app/investor/discover/page.tsx toggles which pane is visible via
 * plain responsive classes) that changes, not this component.
 *
 * Sections follow the brief's "STARTUP PREVIEW CONTENT" list (identity,
 * business, funding, pitch deck) mapped onto PITCON's actual startup
 * fields - there's no separate "Problem"/"Solution" pair in the schema,
 * so `description` and `elevatorPitch` stand in for that section.
 */
function DiscoverPreviewPanel({
  startup,
  backHref,
}: {
  startup: StartupDetail;
  backHref: string;
}) {
  const location = formatLocation(startup.city, startup.country);
  const hasLinks = Boolean(startup.linkedinUrl || startup.twitterUrl || startup.instagramUrl);

  return (
    <div className="flex flex-col gap-6">
      {/* Mobile-only, per the brief's "MOBILE PREVIEW" - desktop always
       * shows both panes, so there's nothing to "go back" to there. */}
      <Link
        href={backHref}
        scroll={false}
        className="inline-flex w-fit items-center gap-1.5 text-small font-medium text-gray-600 hover:text-gray-900 lg:hidden"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to startups
      </Link>

      <Card>
        <CardContent className="flex flex-col gap-5">
          {startup.coverImageUrl && (
            <div className="-mx-6 -mt-6 aspect-[3/1] overflow-hidden rounded-t-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={startup.coverImageUrl} alt="" className="size-full object-cover" />
            </div>
          )}

          <div className="flex items-start gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-card border border-border bg-gray-100">
              {startup.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={startup.logoUrl} alt="" className="size-full object-cover" />
              ) : (
                <Building2 className="size-6 text-gray-300" aria-hidden />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-h3 font-semibold text-gray-900">{startup.name}</h2>
              {startup.tagline && <p className="text-small text-gray-500">{startup.tagline}</p>}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-gray-500">
                {startup.industry && <span>{startup.industry.name}</span>}
                {startup.industry && startup.stage && <span aria-hidden>&middot;</span>}
                {startup.stage && <span>{startup.stage.name}</span>}
                {(startup.industry || startup.stage) && location && <span aria-hidden>&middot;</span>}
                {location && <span>{location}</span>}
              </div>
            </div>
          </div>

          {startup.websiteUrl && (
            <a
              href={startup.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1.5 text-small text-primary hover:underline"
            >
              <Globe className="size-3.5" aria-hidden />
              {startup.websiteUrl}
              <ExternalLink className="size-3" aria-hidden />
            </a>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <ProfileField label="Description" value={startup.description} />
          <ProfileField label="Elevator pitch" value={startup.elevatorPitch} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Traction</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <ProfileField label="Customers / users" value={formatCount(startup.customerCount)} />
          <ProfileField label="Employees" value={formatCount(startup.employeeCount)} />
          <ProfileField label="Annual revenue" value={formatUsd(startup.annualRevenue)} />
          <ProfileField label="Monthly revenue" value={formatUsd(startup.monthlyRevenue)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Funding</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileField label="Funding sought" value={formatUsd(startup.fundingAmountSought)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pitch Deck</CardTitle>
        </CardHeader>
        <CardContent>
          {startup.pitchDeckPath ? (
            <div className="flex items-center gap-1.5 text-small text-gray-500">
              <FileText className="size-3.5 shrink-0" aria-hidden />
              <span>{startup.pitchDeckOriginalName ?? "Pitch deck attached"}</span>
              {/* Investor access to the deck itself is a deliberate gap -
               * see the Sprint 5 final report's "Issues" section. */}
              <span className="text-caption text-gray-400">
                &mdash; investor access is coming in a future sprint
              </span>
            </div>
          ) : (
            <span className="text-body text-gray-400 italic">Not added yet</span>
          )}
        </CardContent>
      </Card>

      {hasLinks && (
        <Card>
          <CardHeader>
            <CardTitle>Links</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            {startup.linkedinUrl && (
              <a
                href={startup.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-small text-primary hover:underline"
              >
                LinkedIn
              </a>
            )}
            {startup.twitterUrl && (
              <a
                href={startup.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-small text-primary hover:underline"
              >
                X (Twitter)
              </a>
            )}
            {startup.instagramUrl && (
              <a
                href={startup.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-small text-primary hover:underline"
              >
                Instagram
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {/* Future interaction space (next sprint): the "Express Interest"
       * primary action mounts here, directly below the preview content -
       * see the brief's "FUTURE INTERACTION SPACE". Deliberately left
       * unrendered: Sprint 5 explicitly excludes that action, and a
       * placeholder button that does nothing would be worse than no
       * button at all. */}
    </div>
  );
}

export { DiscoverPreviewPanel };
