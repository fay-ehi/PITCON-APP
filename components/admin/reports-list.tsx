"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { formatRelativeDate } from "@/lib/format/date";
import { REPORT_REASON_LABELS } from "@/types/report";
import {
  adminUnpublishStartupAction,
  updateReportStatusAction,
} from "@/lib/admin/report-actions";
import type { AdminReportSummary } from "@/types/report";

/**
 * Sprint 15. One row per report, each independently actionable - same
 * "local state per row, not one big refetch" reasoning as
 * users-list.tsx. `revalidatePath` in the actions keeps a later full
 * page load correct regardless.
 */
function ReportsList({ reports: initialReports }: { reports: AdminReportSummary[] }) {
  const [reports, setReports] = useState(initialReports);

  if (reports.length === 0) {
    return (
      <Card className="items-center py-10 text-center text-small text-gray-500">
        No reports to review.
      </Card>
    );
  }

  function handleUpdated(reportId: string, patch: Partial<AdminReportSummary>) {
    setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, ...patch } : r)));
  }

  return (
    <div className="flex flex-col gap-3">
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} onUpdated={handleUpdated} />
      ))}
    </div>
  );
}

function ReportCard({
  report,
  onUpdated,
}: {
  report: AdminReportSummary;
  onUpdated: (reportId: string, patch: Partial<AdminReportSummary>) => void;
}) {
  const [isPending, startTransition] = useTransition();

  function handleStatus(status: "resolved" | "dismissed") {
    startTransition(async () => {
      const result = await updateReportStatusAction(report.id, status);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      onUpdated(report.id, { status });
      toast.success(status === "resolved" ? "Marked resolved." : "Dismissed.");
    });
  }

  function handleUnpublish() {
    if (!report.startup) return;
    startTransition(async () => {
      const result = await adminUnpublishStartupAction(report.startup!.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      onUpdated(report.id, { startup: { ...report.startup!, status: "draft" } });
      toast.success("Startup unpublished.");
    });
  }

  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-small font-medium text-gray-900">
              {report.reportedUserName}
            </p>
            <VerifiedBadge verified={report.reportedUserVerified} />
            <Badge variant={report.reportedUserRole === "founder" ? "primary" : "secondary"}>
              {report.reportedUserRole === "founder" ? "Founder" : "Investor"}
            </Badge>
          </div>
          <p className="text-caption text-gray-500">
            Reported by {report.reporterName} &middot; {formatRelativeDate(report.createdAt)}
          </p>
        </div>
        <Badge
          variant={
            report.status === "open"
              ? "destructive"
              : report.status === "resolved"
                ? "primary"
                : "secondary"
          }
        >
          {report.status === "open" ? "Open" : report.status === "resolved" ? "Resolved" : "Dismissed"}
        </Badge>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-small text-gray-700">{REPORT_REASON_LABELS[report.reason]}</p>
        {report.details && <p className="text-small text-gray-500">{report.details}</p>}
        {report.startup && (
          <Link
            href={`/investor/discover?startup=${report.startup.id}`}
            target="_blank"
            className="text-caption w-fit text-primary hover:underline"
          >
            View startup: {report.startup.name} ({report.startup.status})
          </Link>
        )}
      </div>

      {report.status === "open" && (
        <div className="flex flex-wrap gap-2 pt-1">
          <Button type="button" size="sm" onClick={() => handleStatus("resolved")} disabled={isPending}>
            Mark resolved
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => handleStatus("dismissed")}
            disabled={isPending}
          >
            Dismiss
          </Button>
          {report.startup && report.startup.status === "published" && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleUnpublish}
              disabled={isPending}
            >
              Unpublish startup
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

export { ReportsList };
