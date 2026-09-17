import Link from "next/link";
import { Building2 } from "lucide-react";

import { ShortlistButton } from "@/components/investor/shortlist-button";
import { formatRelativeDate } from "@/lib/format/date";
import { formatUsd } from "@/lib/startup/format";
import type { ShortlistedStartup } from "@/types/shortlist";

/**
 * One card in the Investor's My Shortlist list - mirrors
 * interest-card.tsx's shape closely (same "whole card is one `<Link>`
 * back into Discover's preview" reasoning, same fallback if the
 * startup's no longer published), plus a shortlist toggle so an
 * investor can un-shortlist directly from this page. That button is a
 * sibling of the Link rather than nested inside it - see
 * startup-result-card.tsx's comment on why - and sits in its own
 * footer row below the Link's content rather than as an absolute
 * corner overlay, so it's always anchored to the bottom of the card
 * regardless of how much text is above it.
 */
function ShortlistCard({
  startup,
  onRemoved,
}: {
  startup: ShortlistedStartup;
  onRemoved: (startupId: string) => void;
}) {
  const displayName = startup.name || "Untitled startup";
  const meta = [startup.industry?.name, startup.stage?.name].filter(Boolean).join(" \u00b7 ");
  const funding = formatUsd(startup.fundingAmountSought);

  return (
    <div className="rounded-card shadow-subtle hover:shadow-medium focus-within:ring-primary/30 flex flex-col overflow-hidden bg-white transition-shadow duration-200 focus-within:ring-2">
      <Link
        href={`/investor/discover?startup=${startup.id}`}
        className="flex flex-1 flex-col gap-3 p-5 pb-4 outline-none"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-card bg-primary-50 flex size-12 shrink-0 items-center justify-center overflow-hidden">
            {startup.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage public URL.
              <img src={startup.logoUrl} alt="" className="size-full object-cover" />
            ) : (
              <Building2 className="text-primary size-5" aria-hidden />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-body truncate font-semibold text-gray-900">{displayName}</p>
            {meta && <p className="text-caption truncate text-gray-500">{meta}</p>}
          </div>
          {funding && (
            <p className="shrink-0 text-caption text-gray-700">
              Raising <span className="font-medium">{funding}</span>
            </p>
          )}
        </div>
      </Link>

      <div className="border-border/60 flex items-center justify-between gap-3 border-t px-5 py-3">
        <p className="text-caption text-gray-500">
          Shortlisted {formatRelativeDate(startup.shortlistedAt)}
        </p>
        <ShortlistButton
          startupId={startup.id}
          initialShortlisted
          onToggle={(startupId, shortlisted) => {
            if (!shortlisted) onRemoved(startupId);
          }}
        />
      </div>
    </div>
  );
}

export { ShortlistCard };