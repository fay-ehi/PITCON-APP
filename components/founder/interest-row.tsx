"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InterestStatusBadge } from "@/components/shared/interest-status-badge";
import { VerifiedBadge } from "@/components/shared/verified-badge";
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
 * A real `<button>` for the "open the review dialog" action (not a
 * `<div>` wrapped in one, and not a `Card` nested inside a button) -
 * keeps this natively keyboard-operable with a visible focus ring with
 * no extra wiring, per the brief's accessibility requirements, while
 * still getting the same card visual treatment as the rest of the
 * design system via plain classes.
 *
 * The avatar sits outside that button, as its own `<Link>` to the
 * investor's public profile (`/founder/investors/[investorId]`) -
 * nesting a link inside a button isn't valid HTML, and would make the
 * two actions ("open this investor's profile" vs. "review this
 * interest") impossible to tell apart by click target anyway. The card
 * chrome (shadow/hover/rounding) moved to the shared outer wrapper so
 * both pieces still read as one row.
 */
function InterestRow({ interest }: { interest: FounderInterestSummary }) {
  const [open, setOpen] = useState(false);
  const initial = interest.investor.fullName.trim().slice(0, 1).toUpperCase() || "I";

  return (
    <>
      <div className="rounded-card shadow-subtle hover:shadow-medium flex w-full flex-wrap items-center gap-4 bg-white p-5 transition-shadow duration-200 sm:flex-nowrap">
        <Link
          href={`/founder/investors/${interest.investor.id}`}
          aria-label={`View ${interest.investor.fullName}'s profile`}
          className="rounded-pill shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <Avatar className="size-11 shrink-0">
            <AvatarImage src={interest.investor.avatarUrl ?? undefined} alt="" />
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
        </Link>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          className="focus-visible:ring-primary/30 flex min-w-0 flex-1 flex-wrap items-center gap-4 text-left outline-none focus-visible:ring-2 sm:flex-nowrap"
        >
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 truncate text-body font-semibold text-gray-900">
              <span className="truncate">{interest.investor.fullName}</span>
              <VerifiedBadge verified={interest.investor.verified} />
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
      </div>

      <InterestDetailDialog interest={interest} open={open} onOpenChange={setOpen} />
    </>
  );
}

export { InterestRow };
