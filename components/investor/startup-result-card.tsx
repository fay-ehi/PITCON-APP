import Link from "next/link";
import { Building2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatUsd } from "@/lib/startup/format";
import type { StartupDetail } from "@/types/startup";

/**
 * A single Discover result. The whole card is one clickable/focusable
 * `<Link>` (per the Sprint 5 brief's "the entire card can be
 * clickable") rather than a div with an onClick handler, so it's
 * natively keyboard-operable with no extra wiring.
 */
function StartupResultCard({
  startup,
  href,
  selected,
}: {
  startup: StartupDetail;
  href: string;
  selected: boolean;
}) {
  const meta = [startup.industry?.name, startup.stage?.name, startup.country]
    .filter(Boolean)
    .join(" \u00b7 ");
  const funding = formatUsd(startup.fundingAmountSought);

  return (
    <Link
      href={href}
      scroll={false}
      aria-current={selected ? "true" : undefined}
      className={cn(
        "flex flex-col gap-3 rounded-card border bg-white p-5 transition-colors",
        "focus-visible:ring-primary/30 outline-none focus-visible:ring-2",
        selected
          ? "border-primary bg-primary-50/40 ring-1 ring-primary/30"
          : "border-border hover:border-gray-300 hover:bg-gray-50",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-card border border-border bg-gray-100">
          {startup.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={startup.logoUrl} alt="" className="size-full object-cover" />
          ) : (
            <Building2 className="size-5 text-gray-300" aria-hidden />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-body font-semibold text-gray-900">{startup.name}</p>
          {startup.tagline && (
            <p className="truncate text-caption text-gray-500">{startup.tagline}</p>
          )}
        </div>
      </div>

      {meta && <p className="text-caption text-gray-500">{meta}</p>}

      {funding && (
        <p className="text-small text-gray-700">
          Raising <span className="font-medium">{funding}</span>
        </p>
      )}

      {startup.description && (
        <p className="line-clamp-2 text-small text-gray-500">{startup.description}</p>
      )}

      <span className="mt-auto inline-flex items-center gap-1 text-small font-medium text-primary">
        View Startup <span aria-hidden>&rarr;</span>
      </span>
    </Link>
  );
}

export { StartupResultCard };
