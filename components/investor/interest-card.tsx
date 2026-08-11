import Link from "next/link";
import { Building2 } from "lucide-react";

import { InterestStatusBadge } from "@/components/shared/interest-status-badge";
import { formatRelativeDate } from "@/lib/format/date";
import type { InvestorInterestSummary } from "@/types/interest";

/**
 * One card in the Investor's My Interests list - the brief's mockup:
 * startup name/logo, industry/stage, interest status, and submission
 * date. Links back into Discover's preview for that startup (the whole
 * card is one `<Link>`, same "natively keyboard-operable" reasoning as
 * StartupResultCard) - if the startup is no longer published, Discover's
 * existing "not found" preview state handles that, nothing new needed
 * here for that case.
 */
function InterestCard({ interest }: { interest: InvestorInterestSummary }) {
  const displayName = interest.startup.name || "Untitled startup";
  const meta = [interest.startup.industry, interest.startup.stage].filter(Boolean).join(" \u00b7 ");

  return (
    <Link
      href={`/investor/discover?startup=${interest.startup.id}`}
      className="rounded-card border-border focus-visible:ring-primary/30 flex flex-col gap-3 border bg-white p-5 outline-none transition-colors hover:border-gray-300 hover:bg-gray-50 focus-visible:ring-2"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-card border-border flex size-12 shrink-0 items-center justify-center overflow-hidden border bg-gray-100">
          {interest.startup.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage public URL.
            <img src={interest.startup.logoUrl} alt="" className="size-full object-cover" />
          ) : (
            <Building2 className="size-5 text-gray-300" aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-body truncate font-semibold text-gray-900">{displayName}</p>
          {meta && <p className="text-caption truncate text-gray-500">{meta}</p>}
        </div>
        <InterestStatusBadge status={interest.status} />
      </div>

      <p className="text-caption text-gray-500">
        Submitted {formatRelativeDate(interest.createdAt)}
        {interest.respondedAt && interest.status !== "pending" && (
          <> &middot; Updated {formatRelativeDate(interest.respondedAt)}</>
        )}
      </p>
    </Link>
  );
}

export { InterestCard };
