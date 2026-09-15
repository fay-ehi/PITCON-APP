"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ReportReason } from "@/types/report";

export type SubmitReportResult = { success: false; error: string } | { success: true };

const MAX_DETAILS_LENGTH = 1000;

/**
 * Sprint 15. Filed under the reporter's own RLS session (not the admin
 * client) for the insert itself - `reports_cannot_self_report` and the
 * INSERT policy's `reporter_id = auth.uid()` (migration
 * 20260904090000) are the real backstops, the checks here are just a
 * friendlier error message than a raw constraint violation.
 *
 * `reportedUserId` is optional for the same reason it is in
 * reputation-actions.ts: reporting a startup from Discover only ever
 * has a `startupId` on hand (`StartupDetail` deliberately never
 * carries `founder_id` to the client), so when it's omitted this
 * resolves the founder's id itself, server-side, via the admin client
 * - the founder's raw user id still never needs to reach the
 * investor's browser. My Interests and conversation threads already
 * have the other person's real id in scope, so they pass
 * `reportedUserId` directly and skip the lookup.
 */
export async function submitReportAction(
  reason: ReportReason,
  details: string | null,
  target: {
    reportedUserId?: string;
    startupId?: string;
    conversationId?: string;
  },
): Promise<SubmitReportResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You need to be signed in to do that." };
  }

  let reportedUserId = target.reportedUserId;
  if (!reportedUserId) {
    if (!target.startupId) {
      return { success: false, error: "Couldn't submit your report. Please try again." };
    }
    const admin = createAdminClient();
    const { data: startup } = await admin
      .from("startups")
      .select("founder_id")
      .eq("id", target.startupId)
      .maybeSingle();

    if (!startup) {
      return { success: false, error: "Couldn't submit your report. Please try again." };
    }
    reportedUserId = startup.founder_id;
  }

  if (user.id === reportedUserId) {
    return { success: false, error: "You can't report yourself." };
  }

  const trimmedDetails = details?.trim() || null;
  if (trimmedDetails && trimmedDetails.length > MAX_DETAILS_LENGTH) {
    return {
      success: false,
      error: `Please keep the details under ${MAX_DETAILS_LENGTH} characters.`,
    };
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    reported_user_id: reportedUserId,
    reason,
    details: trimmedDetails,
    startup_id: target.startupId,
    conversation_id: target.conversationId,
  });

  if (error) {
    return {
      success: false,
      error: "Couldn't submit your report. Please try again.",
    };
  }

  return { success: true };
}
