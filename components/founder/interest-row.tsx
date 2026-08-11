"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InterestStatusBadge } from "@/components/shared/interest-status-badge";
import { InterestDetailDialog } from "@/components/founder/interest-detail-dialog";
import { formatRelativeDate } from "@/lib/format/date";
import type { FounderInterestSummary } from "@/types/interest";

/**
 * One row in the Founder Interests list - identifies the investor and,
 * per the brief's "MULTIPLE STARTUPS" section, exactly which startup
 * ("Interested in: Startup Alpha", never just the founder), plus status
 * and submission date. Opens `InterestDetailDialog` for the full review
 * + Accept/Decline.
 *
 * A real `<button>` (not a `<div>` wrapped in one, and not a `Card`
 * nested inside a button) - keeps this natively keyboard-operable with a
 * visible focus ring with no extra wiring, per the brief's accessibility
 * requirements, while still getting the same card visual treatment as
 * the rest of the design system via plain classes.
 */
function InterestRow({ interest }: { interest: FounderInterestSummary }) {
  const [open, setOpen] = useState(false);
  const initial = interest.investor.fullName.trim().slice(0, 1).toUpperCase() || "I";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="rounded-card border-border focus-visible:ring-primary/30 flex w-full flex-wrap items-center gap-4 border bg-white p-5 text-left transition-colors outline-none hover:border-gray-300 hover:bg-gray-50 focus-visible:ring-2 sm:flex-nowrap"
      >
        <Avatar className="size-11 shrink-0">
          <AvatarImage src={interest.investor.avatarUrl ?? undefined} alt="" />
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="text-body truncate font-semibold text-gray-900">
            {interest.investor.fullName}
          </p>
          <p className="text-caption flex items-center gap-1 truncate text-gray-500">
            <Building2 className="size-3 shrink-0" aria-hidden />
            Interested in {interest.startup.name || "Untitled startup"}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <InterestStatusBadge status={interest.status} />
          <span className="text-caption text-gray-400">
            Submitted {formatRelativeDate(interest.createdAt)}
          </span>
        </div>
      </button>

      <InterestDetailDialog interest={interest} open={open} onOpenChange={setOpen} />
    </>
  );
}

export { InterestRow };
