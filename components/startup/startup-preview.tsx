import Link from "next/link";
import { Building2, ExternalLink, FileText, Globe } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileField } from "@/components/profile/profile-field";
import { formatCount, formatLocation, formatUsd } from "@/lib/startup/format";
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
            <div className="rounded-card bg-gray-100 border-border flex size-16 shrink-0 items-center justify-center overflow-hidden border">
              {startup.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={startup.logoUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <Building2 className="size-6 text-gray-300" aria-hidden />
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
              <div className="text-caption flex flex-wrap items-center gap-x-2 gap-y-1 text-gray-500">
                {startup.industry && <span>{startup.industry.name}</span>}
                {startup.industry && startup.stage && <span>•</span>}
                {startup.stage && <span>{startup.stage.name}</span>}
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
        <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
