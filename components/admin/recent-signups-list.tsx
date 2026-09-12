import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate } from "@/lib/format/date";
import type { RecentSignup } from "@/lib/queries/admin";

export function RecentSignupsList({ signups }: { signups: RecentSignup[] }) {
  if (signups.length === 0) {
    return (
      <Card className="items-center py-10 text-center text-small text-gray-500">
        No signups yet.
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {signups.map((signup) => (
        <div
          key={signup.id}
          className="flex items-center justify-between gap-4 rounded-card shadow-subtle bg-white p-4"
        >
          <div className="min-w-0">
            <p className="truncate text-small font-medium text-gray-900">{signup.fullName}</p>
            <p className="text-caption text-gray-500">{formatRelativeDate(signup.createdAt)}</p>
          </div>
          <Badge variant={signup.role === "founder" ? "primary" : "secondary"}>
            {signup.role === "founder" ? "Founder" : "Investor"}
          </Badge>
        </div>
      ))}
    </div>
  );
}
