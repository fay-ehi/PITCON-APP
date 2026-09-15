import { CalendarDays, MessageCircle, Sparkles } from "lucide-react";

import { formatMonthYear } from "@/lib/format/date";
import type { EngagementSummary } from "@/types/reputation";

/**
 * Sprint 14 - the honest, platform-observed alternative to a
 * self-reported track record (see lib/queries/reputation.ts's top
 * comment). Shown to a founder about an investor (My Interests) and to
 * an investor about a founder (Discover), in the same spot each side
 * is already deciding "should I engage with this person."
 */
function EngagementStats({ summary }: { summary: EngagementSummary }) {
  return (
    <div className="flex flex-col gap-2 text-small text-gray-600">
      <div className="flex items-center gap-2">
        <CalendarDays className="size-4 shrink-0 text-gray-400" aria-hidden />
        <span>On PITCON since {formatMonthYear(summary.memberSince)}</span>
      </div>

      {summary.interestCount !== null && (
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 shrink-0 text-gray-400" aria-hidden />
          <span>
            Expressed interest in {summary.interestCount}{" "}
            {summary.interestCount === 1 ? "startup" : "startups"} on PITCON
          </span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <MessageCircle className="size-4 shrink-0 text-gray-400" aria-hidden />
        {summary.engagementRate ? (
          <span>
            Active in {summary.engagementRate.activeConversations} of{" "}
            {summary.engagementRate.totalConversations}{" "}
            {summary.engagementRate.totalConversations === 1 ? "conversation" : "conversations"} on
            PITCON
          </span>
        ) : (
          <span>No conversations on PITCON yet</span>
        )}
      </div>
    </div>
  );
}

export { EngagementStats };
