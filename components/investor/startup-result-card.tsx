import type { MouseEvent } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatUsd } from "@/lib/startup/format";
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
}: {
  startup: StartupDetail;
  href: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const meta = [startup.industry?.name, startup.stage?.name, startup.country]
    .filter(Boolean)
    .join(" \u00b7 ");
  const funding = formatUsd(startup.fundingAmountSought);

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
    <Link
      href={href}
      scroll={false}
      onClick={handleClick}
      aria-current={selected ? "true" : undefined}
      className={cn(
        "flex flex-col gap-4 rounded-card border bg-white p-5 transition-colors sm:flex-row sm:items-start sm:gap-5 lg:p-6",
        "outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        selected
          ? "border-primary bg-primary-50/40 ring-1 ring-primary/30"
          : "border-border hover:border-gray-300 hover:bg-gray-50",
      )}
    >
      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-card border border-border bg-gray-100">
        {startup.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={startup.logoUrl} alt="" className="size-full object-cover" />
        ) : (
          <Building2 className="size-5 text-gray-300" aria-hidden />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
          <div className="min-w-0">
            <p className="truncate text-body font-semibold text-gray-900">{startup.name}</p>
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

        {meta && <p className="text-caption text-gray-500">{meta}</p>}

        {startup.description && (
          <p className="line-clamp-2 text-small text-gray-500">{startup.description}</p>
        )}

        <span className="mt-1 inline-flex w-fit items-center gap-1 text-small font-medium text-primary">
          View Startup <span aria-hidden>&rarr;</span>
        </span>
      </div>
    </Link>
  );
}

export { StartupResultCard };
