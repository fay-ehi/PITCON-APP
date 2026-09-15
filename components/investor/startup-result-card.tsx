import type { MouseEvent } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { formatUsd } from "@/lib/startup/format";
import { getIndustryAccent } from "@/lib/startup/industry-accent";
import { ShortlistButton } from "@/components/investor/shortlist-button";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import type { StartupDetail } from "@/types/startup";

/**
 * A single Discover result row - a long, full-width horizontal card
 * (Upwork/LinkedIn-style row). Still a real `<Link href>` (keyboard
 * focusable, works with JS disabled, right-click/middle-click/
 * Cmd+click "open in new tab" all behave natively) - `onSelect` is an
 * addition on top of that, not a replacement for it, so it only takes
 * over on an ordinary left-click. That's what lets the parent
 * (discover-workspace.tsx) show the preview optimistically instead of
 * waiting for the navigation to land - see that file's top comment.
 */
function StartupResultCard({
  startup,
  href,
  selected,
  onSelect,
  shortlisted,
  onShortlistToggle,
}: {
  startup: StartupDetail;
  href: string;
  selected: boolean;
  onSelect: () => void;
  shortlisted: boolean;
  onShortlistToggle: (startupId: string, shortlisted: boolean) => void;
}) {
  const meta = [startup.stage?.name, startup.country].filter(Boolean).join(" \u00b7 ");
  const funding = formatUsd(startup.fundingAmountSought);
  const accent = getIndustryAccent(startup.industry?.slug);
  const Icon = accent.icon;

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    // Modifier/middle clicks mean "open in a new tab" - let the browser
    // handle those natively rather than hijacking them for the
    // in-page optimistic preview.
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    onSelect();
  }

  return (
    // The Sprint 12 shortlist button below is a real `<button>`, and a
    // `<button>` nested inside this card's `<a>` (via next/link) would
    // be invalid HTML - two interactive elements, one inside the
    // other, which confuses keyboard/screen-reader activation. Instead
    // the button is a plain sibling of the Link, overlaid via absolute
    // positioning on this wrapping `relative` div, so clicking it never
    // reaches the Link underneath (browsers dispatch the click to
    // whichever element is topmost at that point, not to the anchor).
    <div className="relative">
      <Link
        href={href}
        scroll={false}
        onClick={handleClick}
        aria-current={selected ? "true" : undefined}
        className={cn(
          "relative flex flex-col gap-4 overflow-hidden rounded-card bg-white p-5 transition-all duration-200 sm:flex-row sm:items-start sm:gap-5 lg:p-6",
          "outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
          selected
            ? "shadow-strong ring-2 ring-primary bg-primary-50/40"
            : "shadow-subtle hover:shadow-medium",
        )}
      >
        <div className={cn("flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-card", accent.solidBg)}>
          {startup.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={startup.logoUrl} alt="" className="size-full object-cover" />
          ) : (
            <Icon className={cn("size-5", accent.solidText)} aria-hidden />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
            <div className="min-w-0">
              <p className="flex items-center gap-1 text-body font-semibold text-gray-900">
                <span className="truncate">{startup.name}</span>
                <VerifiedBadge verified={startup.founderVerified} />
              </p>
              {startup.tagline && (
                <p className="truncate text-small text-gray-500">{startup.tagline}</p>
              )}
            </div>
            {funding && (
              <p className="shrink-0 text-small text-gray-700">
                Raising <span className="font-medium">{funding}</span>
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {startup.industry && (
              <span className={cn("text-caption inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium", accent.softBg, accent.softText)}>
                {startup.industry.name}
              </span>
            )}
            {meta && <span className="text-caption text-gray-400">{meta}</span>}
          </div>

          {startup.description && (
            <p className="line-clamp-2 text-small text-gray-500">{startup.description}</p>
          )}

          <span className="mt-1 inline-flex w-fit items-center gap-1 pr-11 text-small font-medium text-primary">
            View Startup <span aria-hidden>&rarr;</span>
          </span>
        </div>
      </Link>
      <ShortlistButton
        startupId={startup.id}
        initialShortlisted={shortlisted}
        onToggle={onShortlistToggle}
        className="absolute right-4 bottom-4 sm:right-5 sm:bottom-5 lg:right-6 lg:bottom-6"
      />
    </div>
  );
}

export { StartupResultCard };
