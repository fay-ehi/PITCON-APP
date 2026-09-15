import { Eye, TrendingUp, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { investorTypeLabel } from "@/constants/investor-types";
import { formatRelativeDate } from "@/lib/format/date";
import { cn } from "@/lib/utils";
import type { StartupAnalyticsSummary } from "@/types/analytics";

/**
 * Sprint 12 (Founder Analytics) - the "Insights" section on a
 * startup's detail page: total views, unique investors, a 14-day trend
 * (plain CSS bars - no charting library added just for this one card,
 * see the Sprint 12 migration's design note), and who's recently
 * viewed it. Server-rendered from `getStartupAnalytics`, no client
 * interactivity of its own.
 *
 * Deliberately shows nothing for a draft (see
 * `StartupAnalyticsCardPlaceholder` below, rendered by the caller
 * instead) rather than a card full of zeros - a draft can never have
 * been viewed, so "0 views" would read like something's broken rather
 * than like the expected pre-launch state.
 */
function StartupAnalyticsCard({ analytics }: { analytics: StartupAnalyticsSummary }) {
  const maxDayCount = Math.max(1, ...analytics.viewsLast14Days.map((d) => d.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-card bg-gray-50 p-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary">
              <Eye className="size-4" aria-hidden />
            </div>
            <div>
              <p className="text-h3 font-semibold text-gray-900">{analytics.totalViews}</p>
              <p className="text-caption text-gray-500">Total views</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-card bg-gray-50 p-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary">
              <Users className="size-4" aria-hidden />
            </div>
            <div>
              <p className="text-h3 font-semibold text-gray-900">{analytics.uniqueInvestorCount}</p>
              <p className="text-caption text-gray-500">Unique investors</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-caption font-medium text-gray-500">
            <TrendingUp className="size-3.5" aria-hidden />
            Views, last 14 days
          </div>
          <div className="flex h-16 items-end gap-1">
            {analytics.viewsLast14Days.map((day) => (
              <div
                key={day.date}
                className="flex-1 rounded-t-sm bg-primary-200"
                style={{ height: `${Math.max(4, (day.count / maxDayCount) * 100)}%` }}
                title={`${day.date}: ${day.count} view${day.count === 1 ? "" : "s"}`}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-caption font-medium text-gray-500">Recently viewed by</p>
          {analytics.recentViewers.length === 0 ? (
            <p className="text-small text-gray-400 italic">No views yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {analytics.recentViewers.map((viewer) => {
                const initial = (viewer.fullName ?? "I").trim().slice(0, 1).toUpperCase() || "I";
                const typeLabel = investorTypeLabel(viewer.investorType);
                const meta = [viewer.organization, typeLabel].filter(Boolean).join(" \u00b7 ");

                return (
                  <li key={viewer.investorId} className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarImage src={viewer.avatarUrl ?? undefined} alt="" />
                      <AvatarFallback>{initial}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-small font-medium text-gray-900">
                        {viewer.fullName ?? "Investor"}
                      </p>
                      {meta && <p className="truncate text-caption text-gray-500">{meta}</p>}
                    </div>
                    <span className="shrink-0 text-caption text-gray-400">
                      {formatRelativeDate(viewer.viewedAt)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Shown in place of `StartupAnalyticsCard` for a draft startup - never
 * viewed yet since drafts can't appear in Discover, so there's nothing
 * to show insights against. A short nudge rather than a zeroed-out
 * card, per that same reasoning.
 */
function StartupAnalyticsCardPlaceholder({ className }: { className?: string }) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-small text-gray-500">
          Publish your startup to start seeing investor views and interest here.
        </p>
      </CardContent>
    </Card>
  );
}

export { StartupAnalyticsCard, StartupAnalyticsCardPlaceholder };
