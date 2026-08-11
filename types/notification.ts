import type { Database } from "@/types/database.types";

export type NotificationType = Database["public"]["Enums"]["notification_type"];
export type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];

/** One row in a Notifications list (founder or investor) - see
 * `lib/queries/notifications.ts`. */
export type NotificationSummary = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  linkPath: string;
  isRead: boolean;
  createdAt: string;
};
