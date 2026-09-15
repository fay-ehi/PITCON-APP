import { CalendarDays } from "lucide-react";

import { formatMonthYear } from "@/lib/format/date";
import type { EngagementSummary } from "@/types/reputation";

/**
 * Sprint 14 - the honest, platform-observed alternative to a
 * self-reported track record (see lib/queries/reputation.ts's top
 * comment). Shown to a founder about an investor (My Interests) and to
 * an investor about a founder (Discover), in the same spot each side
 * is already deciding "should I engage with this person."
 *
 * Only the member-since date is surfaced here - the interest-count and
 * conversation-activity lines were removed per product feedback.
 * `EngagementSummary.interestCount` / `.engagementRate` are still
 * fetched (see types/reputation.ts and lib/queries/reputation.ts) but
 * intentionally unused below; leaving the fetch alone keeps this a
 * display-only change.
 */
function EngagementStats({ summary }: { summary: EngagementSummary }) {
  return (
    <div className="flex items-center gap-2 text-small text-gray-600">
      <CalendarDays className="size-4 shrink-0 text-gray-400" aria-hidden />
      <span>On PITCON since {formatMonthYear(summary.memberSince)}</span>
    </div>
  );
}

export { EngagementStats };
