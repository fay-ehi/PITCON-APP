"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type MarkNotificationsReadResult =
  { success: false; error: string } | { success: true };

/**
 * Marks every one of the signed-in user's currently-unread notifications
 * as read - fired once, on mount, by `MarkNotificationsRead` when either
 * Notifications page is viewed (see components/notifications/). A plain
 * "mark everything read on view" rather than per-item controls: it's the
 * simplest behavior that satisfies the brief's "notification unread
 * state works correctly" without turning this into a bigger
 * notification-center UI than the brief asks for.
 *
 * Scoped by `recipient_id = user.id` on the update (RLS enforces the
 * same thing - see "Users can mark own notifications read" in the
 * Sprint 6 migration - this is the friendly-error mirror of it). Only
 * `read_at` is ever written; `protect_notification_update()` rejects
 * anything else a client update could try to change.
 */
export async function markAllNotificationsReadAction(): Promise<MarkNotificationsReadResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You need to be signed in to do that." };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", user.id)
    .is("read_at", null);

  if (error) {
    return { success: false, error: "Couldn't update notifications. Please try again." };
  }

  revalidatePath("/founder/notifications");
  revalidatePath("/investor/notifications");

  return { success: true };
}
