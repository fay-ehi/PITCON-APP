"use server";

import { revalidatePath } from "next/cache";

import { checkAdminAccess } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ReportStatus } from "@/types/report";

export type AdminActionResult = { success: false; error: string } | { success: true };

/**
 * Sprint 15. Marks a report reviewed/dismissed - the queue's baseline
 * action, available regardless of whether the report warranted doing
 * anything else. `checkAdminAccess()` re-runs the allowlist check
 * here for the same reason `setVerifiedAction` does (migration
 * 20260903090000's Sprint 13 comment): a Server Action is independently
 * invocable, so the page it's called from isn't a substitute for
 * checking inside the action itself.
 */
export async function updateReportStatusAction(
  reportId: string,
  status: ReportStatus,
): Promise<AdminActionResult> {
  const access = await checkAdminAccess();
  if (access.status !== "ok") {
    return { success: false, error: "Not authorized." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("reports")
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by_email: access.session.email,
    })
    .eq("id", reportId);

  if (error) {
    return { success: false, error: "Couldn't update this report. Please try again." };
  }

  revalidatePath("/admin/reports");
  return { success: true };
}

/**
 * Unpublishing a reported startup - reusing the existing `status`
 * column rather than adding any new moderation-specific schema. A
 * founder can already move their own startup between draft/published
 * freely; this is the same transition, just triggered by an admin
 * instead, which is why it needs the admin client rather than the
 * founder's own RLS session.
 */
export async function adminUnpublishStartupAction(startupId: string): Promise<AdminActionResult> {
  const access = await checkAdminAccess();
  if (access.status !== "ok") {
    return { success: false, error: "Not authorized." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("startups").update({ status: "draft" }).eq("id", startupId);

  if (error) {
    return { success: false, error: "Couldn't unpublish this startup. Please try again." };
  }

  revalidatePath("/admin/reports");
  return { success: true };
}
