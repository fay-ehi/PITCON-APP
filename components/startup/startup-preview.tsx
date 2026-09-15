import Link from "next/link";
import { ExternalLink, FileText, Globe } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileField } from "@/components/profile/profile-field";
import { formatCount, formatLocation, formatUsd } from "@/lib/startup/format";
import { getIndustryAccent } from "@/lib/startup/industry-accent";
import type { StartupDetail } from "@/types/startup";

/**
 * Read-only startup preview - per the Sprint 3 brief's section 12, "so
 * founders can see how their startup information will eventually appear
 * to investors." Deliberately NOT the final Investor Discovery card
 * (that's a later sprint) - just an organized read-out of everything on
 * file, in the same section grouping as the edit form.
 */
function StartupPreview({
  startup,
  pitchDeckUrl,
}: {
  startup: StartupDetail;
  /** A short-lived signed URL for the deck, resolved server-side by the
   * caller (`getPitchDeckSignedUrl`) - `null` if there's no deck, or if
   * signing failed. Never a stored/public URL, see the Sprint 3
   * migration's rationale for why the bucket is private. */
  pitchDeckUrl: string | null;
}) {
  const location = formatLocation(startup.city, startup.country);
  const accent = getIndustryAccent(startup.industry?.slug);
  const Icon = accent.icon;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col gap-5 pt-2">
          {startup.coverImageUrl && (
            <div className="rounded-card -mx-6 -mt-2 mb-1 aspect-[3/1] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={startup.coverImageUrl}
                alt=""
                className="size-full object-cover"
              />
            </div>
          )}

          <div className="flex items-start gap-4">
            <div className={`rounded-card flex size-16 shrink-0 items-center justify-center overflow-hidden ${accent.solidBg}`}>
              {startup.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={startup.logoUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <Icon className={`size-6 ${accent.solidText}`} aria-hidden />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-h3 font-semibold text-gray-900">
                {startup.name ?? (
                  <span className="text-gray-400 italic">Unnamed startup</span>
                )}
              </h1>
              {startup.tagline && (
                <p className="text-small text-gray-500">{startup.tagline}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                {startup.industry && (
                  <span className={`text-caption inline-flex items-center rounded-full px-2 py-0.5 font-medium ${accent.softBg} ${accent.softText}`}>
                    {startup.industry.name}
                  </span>
                )}
                {startup.stage && (
                  <span className="text-caption text-gray-500">{startup.stage.name}</span>
                )}
              </div>
            </div>
          </div>

          {startup.websiteUrl && (
            <a
              href={startup.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-small text-primary inline-flex w-fit items-center gap-1.5 hover:underline"
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
        <CardContent>
          <ProfileField label="Description" value={startup.description} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <ProfileField label="Headquarters" value={location} />
          <ProfileField
            label="Funding sought"
            value={formatUsd(startup.fundingAmountSought)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Traction</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <ProfileField
              label="Annual revenue"
              value={formatUsd(startup.annualRevenue)}
            />
            <ProfileField
              label="Monthly revenue"
              value={formatUsd(startup.monthlyRevenue)}
            />
            <ProfileField
              label="Customers / users"
              value={formatCount(startup.customerCount)}
            />
            <ProfileField
              label="Employees"
              value={formatCount(startup.employeeCount)}
            />
            <ProfileField
              label="Total funding raised to date"
              value={formatUsd(startup.fundingRaisedToDate)}
            />
            <ProfileField
              label="Current valuation"
              value={formatUsd(startup.valuation)}
            />
            <ProfileField
              label="Monthly burn rate"
              value={formatUsd(startup.monthlyBurnRate)}
            />
            <ProfileField
              label="Runway"
              value={
                startup.runwayMonths !== null
                  ? `${formatCount(startup.runwayMonths)} months`
                  : null
              }
            />
          </div>
          <ProfileField
            label="Traction highlights"
            value={startup.tractionHighlights}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pitch</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <ProfileField label="Elevator pitch" value={startup.elevatorPitch} />
          <div className="flex flex-col gap-1">
            <span className="text-caption font-medium text-gray-500">
              Pitch deck
            </span>
            {pitchDeckUrl ? (
              <Link
                href={pitchDeckUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-small text-primary inline-flex w-fit items-center gap-1.5 hover:underline"
              >
                <FileText className="size-3.5" aria-hidden />
                {startup.pitchDeckOriginalName ?? "View pitch deck"}
                <ExternalLink className="size-3" aria-hidden />
              </Link>
            ) : (
              <span className="text-body text-gray-400 italic">
                Not added yet
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-caption font-medium text-gray-500">
              Pitch video
            </span>
            {startup.pitchVideoUrl ? (
              <a
                href={startup.pitchVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-small text-primary inline-flex w-fit items-center gap-1.5 hover:underline"
              >
                <Globe className="size-3.5" aria-hidden />
                {startup.pitchVideoUrl}
                <ExternalLink className="size-3" aria-hidden />
              </a>
            ) : (
              <span className="text-body text-gray-400 italic">
                Not added yet
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {(startup.linkedinUrl || startup.twitterUrl || startup.instagramUrl) && (
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
    </div>
  );
}

export { StartupPreview };
