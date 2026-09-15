import type { Metadata } from "next";

import { getReportsForAdmin } from "@/lib/queries/admin";
import { ReportsList } from "@/components/admin/reports-list";

export const metadata: Metadata = {
  title: "Reports",
};

/**
 * Sprint 15 (Reporting & Flagging). The review queue the app/admin
 * dashboard has, since Sprint 9 or so, honestly said didn't exist yet.
 * Open reports first (no filter UI yet - `getReportsForAdmin(status)`
 * supports one, but with reporting brand new there's no queue depth to
 * justify it) so whoever's triaging always lands on what still needs a
 * decision.
 */
export default async function AdminReportsPage() {
  const reports = await getReportsForAdmin("open");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h3 font-semibold text-gray-900">Reports</h1>
        <p className="text-small text-gray-500">
          Open reports from founders and investors, most recent first.
        </p>
      </div>

      <ReportsList reports={reports} />
    </div>
  );
}
