import { Building2 } from "lucide-react";

import { formatUsd } from "@/lib/startup/format";

/**
 * Small live-updating preview card for the desktop split layout (Sprint
 * 3 brief section 19: "Form | Preview / Progress"). Deliberately much
 * lighter than `StartupPreview` - just enough for the founder to sanity
 * check what they're typing without re-rendering the whole preview on
 * every keystroke. The full preview lives at `/founder/startup`.
 */
function StartupMiniPreview({
  name,
  tagline,
  logoUrl,
  industryName,
  stageName,
  fundingAmountSought,
}: {
  name: string;
  tagline: string;
  logoUrl: string | null;
  industryName: string | null;
  stageName: string | null;
  fundingAmountSought: number | null;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="rounded-card bg-gray-100 border-border flex size-11 shrink-0 items-center justify-center overflow-hidden border">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="size-full object-cover" />
          ) : (
            <Building2 className="size-4 text-gray-300" aria-hidden />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-small truncate font-semibold text-gray-900">
            {name || "Your startup name"}
          </p>
          {tagline && (
            <p className="text-caption truncate text-gray-500">{tagline}</p>
          )}
        </div>
      </div>

      {(industryName || stageName) && (
        <div className="text-caption flex flex-wrap gap-x-2 text-gray-500">
          {industryName && <span>{industryName}</span>}
          {industryName && stageName && <span>•</span>}
          {stageName && <span>{stageName}</span>}
        </div>
      )}

      {fundingAmountSought !== null && (
        <p className="text-caption text-gray-500">
          Seeking{" "}
          <span className="font-medium text-gray-700">
            {formatUsd(fundingAmountSought)}
          </span>
        </p>
      )}
    </div>
  );
}

export { StartupMiniPreview };
