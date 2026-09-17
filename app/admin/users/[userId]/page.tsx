import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Briefcase, Building2, Globe, Landmark, MapPin, Wallet } from "lucide-react";

import { getAdminUserProfileDetail } from "@/lib/queries/admin";
import { investorTypeLabel } from "@/constants/investor-types";
import { formatMonthYear } from "@/lib/format/date";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileField } from "@/components/profile/profile-field";
import { VerifyToggleButton } from "@/components/admin/verify-toggle-button";

export const metadata: Metadata = {
  title: "User",
};

/** Same formatting convention as `formatUsd` in
 * app/investor/profile/page.tsx - kept local rather than shared, per
 * that file's own comment on why. */
function formatUsd(amount: number | null): string | null {
  if (amount === null) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * The "view profile" destination from `/admin/users` - answers the
 * question this whole feature request started with: an operator
 * deciding whether to verify someone shouldn't have to guess from just
 * a name, a role badge, and a signup date. Reuses the same
 * `ProfileHeader`/`ProfileField` building blocks the Founder/Investor
 * self-view and public-view pages already use, so a verified badge and
 * a profile card look the same everywhere in PITCON - just fed by
 * `getAdminUserProfileDetail` (the admin-client query, not RLS-scoped
 * `getFounderProfileDetail`/`getInvestorProfileDetail`) so this one
 * page can open literally any account, not just ones the operator's
 * own session could otherwise see.
 *
 * The Verify/Unverify control lives here too, not just on the list row
 * - `VerifyToggleButton` is the same `setVerifiedAction` `UsersList`
 * already calls, so toggling from either place stays in sync via that
 * action's own `revalidatePath` calls.
 */
export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const user = await getAdminUserProfileDetail(userId);
  if (!user) notFound();

  const isFounder = user.role === "founder";
  const fundingRangeLabel =
    user.fundingRangeMin !== null || user.fundingRangeMax !== null
      ? `${formatUsd(user.fundingRangeMin) ?? "Any"} \u2013 ${
          formatUsd(user.fundingRangeMax) ?? "Any"
        }`
      : null;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/users"
        className="text-small inline-flex w-fit items-center gap-1 text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to Users
      </Link>

      <ProfileHeader
        name={user.fullName}
        avatarUrl={user.avatarUrl}
        subtitle={isFounder ? user.jobTitle : user.organization}
        roleLabel={isFounder ? "Founder" : "Investor"}
        editHref={null}
        verified={user.verified}
      />

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-card bg-white p-5 shadow-subtle">
        <div className="flex items-center gap-3">
          <Badge variant={isFounder ? "primary" : "secondary"}>
            {isFounder ? "Founder" : "Investor"}
          </Badge>
          <span className="text-caption text-gray-500">
            On PITCON since {formatMonthYear(user.createdAt)}
          </span>
        </div>
        <VerifyToggleButton userId={user.id} role={user.role} initialVerified={user.verified} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>At a glance</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {isFounder ? (
                <>
                  <ProfileField icon={Briefcase} label="Job title" value={user.jobTitle} />
                  <ProfileField icon={MapPin} label="Country" value={user.country} />
                  <ProfileField
                    icon={Globe}
                    label="LinkedIn / Website / Portfolio"
                    value={
                      user.websiteUrl ? (
                        <a
                          href={user.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {user.websiteUrl}
                        </a>
                      ) : null
                    }
                  />
                </>
              ) : (
                <>
                  <ProfileField icon={Building2} label="Organization" value={user.organization} />
                  <ProfileField
                    icon={Landmark}
                    label="Investor type"
                    value={investorTypeLabel(user.investorType)}
                  />
                  <ProfileField icon={MapPin} label="Country" value={user.country} />
                  <ProfileField icon={Wallet} label="Funding range" value={fundingRangeLabel} />
                  <ProfileField
                    icon={Globe}
                    label="LinkedIn"
                    value={
                      user.linkedinUrl ? (
                        <a
                          href={user.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {user.linkedinUrl}
                        </a>
                      ) : null
                    }
                  />
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileField label="Bio" value={user.bio} />
            </CardContent>
          </Card>

          {!isFounder && (
            <Card>
              <CardHeader>
                <CardTitle>Investment preferences</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <span className="text-caption font-medium text-gray-500">Industries</span>
                  {user.industries.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.industries.map((industry) => (
                        <span
                          key={industry.id}
                          className="text-caption bg-primary-50 text-primary-700 inline-flex items-center rounded-full px-2.5 py-1 font-medium"
                        >
                          {industry.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-body text-gray-400 italic">Not added yet</span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-caption font-medium text-gray-500">Startup stages</span>
                  {user.stages.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.stages.map((stage) => (
                        <span
                          key={stage.id}
                          className="text-caption bg-primary-50 text-primary-700 inline-flex items-center rounded-full px-2.5 py-1 font-medium"
                        >
                          {stage.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-body text-gray-400 italic">Not added yet</span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
