import { Card } from "@/components/ui/card";
import { InterestStatusBadge } from "@/components/shared/interest-status-badge";
import { formatRelativeDate } from "@/lib/format/date";
import type { RecentInterest } from "@/lib/queries/admin";

export function RecentInterestsList({ interests }: { interests: RecentInterest[] }) {
  if (interests.length === 0) {
    return (
      <Card className="items-center py-10 text-center text-small text-gray-500">
        No interests yet.
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {interests.map((interest) => (
        <div
          key={interest.id}
          className="flex items-center justify-between gap-4 rounded-card border border-border bg-white p-4"
        >
          <div className="min-w-0">
            <p className="truncate text-small font-medium text-gray-900">
              {interest.investorName}
              <span className="font-normal text-gray-500"> → </span>
              {interest.startupName ?? "Untitled startup"}
            </p>
            <p className="text-caption text-gray-500">{formatRelativeDate(interest.createdAt)}</p>
          </div>
          <InterestStatusBadge status={interest.status} />
        </div>
      ))}
    </div>
  );
}
