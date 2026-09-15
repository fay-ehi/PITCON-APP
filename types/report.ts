export type ReportReason =
  | "spam_or_scam"
  | "harassment"
  | "fake_profile"
  | "inappropriate_content"
  | "other";

export type ReportStatus = "open" | "resolved" | "dismissed";

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  spam_or_scam: "Spam or scam",
  harassment: "Harassment or abuse",
  fake_profile: "Fake profile",
  inappropriate_content: "Inappropriate content",
  other: "Other",
};

/** One row in the admin `/admin/reports` triage queue. */
export type AdminReportSummary = {
  id: string;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  createdAt: string;
  reporterName: string;
  reportedUserName: string;
  reportedUserId: string;
  reportedUserRole: "founder" | "investor";
  reportedUserVerified: boolean;
  startup: { id: string; name: string; status: "draft" | "published" } | null;
};
