import Link from "next/link";

import { Button } from "@/components/ui/button";
import { RecentSignupsList } from "@/components/admin/recent-signups-list";
import { RecentInterestsList } from "@/components/admin/recent-interests-list";
import { getRecentInterests, getRecentSignups, getReportsForAdmin } from "@/lib/queries/admin";

/**
 * The admin overview, added in the pre-launch hardening pass. Started
 * with two real panels (signups, interests) and one honest placeholder
 * for reporting/flagging - Sprint 15 built that feature (migration
 * 20260904090000), so this now links to a real queue instead.
 */
export default async function AdminPage() {
  const [signups, interests, openReports] = await Promise.all([
    getRecentSignups(),
    getRecentInterests(),
    getReportsForAdmin("open"),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-h3 font-semibold text-gray-900">Recent signups</h2>
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/users">Verify users</Link>
          </Button>
        </div>
        <RecentSignupsList signups={signups} />
      </section>

      <section>
        <h2 className="mb-4 text-h3 font-semibold text-gray-900">Recent interests</h2>
        <RecentInterestsList interests={interests} />
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-h3 font-semibold text-gray-900">Reports</h2>
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/reports">
              Review {openReports.length > 0 ? `(${openReports.length} open)` : ""}
            </Link>
          </Button>
        </div>
        <p className="text-small text-gray-500">
          {openReports.length === 0
            ? "No open reports right now."
            : `${openReports.length} report${openReports.length === 1 ? "" : "s"} waiting for review.`}
        </p>
      </section>
    </div>
  );
}
