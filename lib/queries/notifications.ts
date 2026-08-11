import { createClient } from "@/lib/supabase/server";
import type { NotificationSummary } from "@/types/notification";

/**
 * Server-only data fetchers for the Sprint 6 notification foundation.
 * Every row here was written by one of the `startup_interests` triggers
 * in the Sprint 6 migration - there's nothing else feeding this table
 * yet, per the brief's "build the data/event foundation required for
 * this workflow without creating an unrelated notification redesign."
 */

/** Every notification for the signed-in user, newest first - backs both
 * `/founder/notifications` and `/investor/notifications` (recipient_id
 * is a plain `profiles.id`, so the same query works for either role). */
export async function getNotificationsForUser(
  userId: string,
): Promise<NotificationSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load notifications: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    linkPath: row.link_path,
    isRead: row.read_at !== null,
    createdAt: row.created_at,
  }));
}

/** How many unread notifications the signed-in user has - powers the
 * top-bar bell badge in both `FounderTopBar` and `InvestorTopBar`. Uses
 * `head: true`/`count: "exact"` so this is a single indexed count query
 * (see `notifications_recipient_unread_idx` in the Sprint 6 migration),
 * not a full row fetch. */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", userId)
    .is("read_at", null);

  if (error) {
    throw new Error(`Failed to load unread notification count: ${error.message}`);
  }

  return count ?? 0;
}
