import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Bell } from "lucide-react";

import { getCurrentUserProfile } from "@/lib/auth/session";
import { getNotificationsForUser } from "@/lib/queries/notifications";
import { Container } from "@/components/shared/container";
import { Card, CardContent } from "@/components/ui/card";
import { NotificationList } from "@/components/notifications/notification-list";
import { MarkNotificationsRead } from "@/components/notifications/mark-notifications-read";

export const metadata: Metadata = {
  title: "Notifications",
};

/**
 * Notifications destination for the Founder sidebar's bell - a
 * chronological event feed, as distinct from Interests (the full,
 * detailed investor-interest record - see app/founder/interests/).
 *
 * As of Sprint 6, this reads real `notifications` rows (see
 * lib/queries/notifications.ts) - previously always the "no
 * notifications yet" placeholder, since nothing populated a
 * `notifications` table before this sprint's Interest workflow did.
 * `MarkNotificationsRead` marks everything shown here read right after
 * this snapshot renders, so the badge in FounderTopBar reflects it on
 * the next navigation without this page itself losing the "which of
 * these were new" distinction on this visit.
 */
export default async function FounderNotificationsPage() {
  const current = await getCurrentUserProfile();
  if (!current) redirect("/login?next=/founder/notifications");

  const notifications = await getNotificationsForUser(current.userId);

  return (
    <Container className="py-10 sm:py-12">
      <MarkNotificationsRead />

      <h1 className="text-h2 text-gray-900">Notifications</h1>
      <p className="mt-1 text-small text-gray-500">
        Investor interest and account updates.
      </p>

      {notifications.length > 0 ? (
        <div className="mt-8">
          <NotificationList notifications={notifications} />
        </div>
      ) : (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-pill bg-primary-50">
              <Bell className="size-6 text-primary" aria-hidden />
            </div>
            <div>
              <p className="text-small font-medium text-gray-900">No notifications yet</p>
              <p className="mt-1 max-w-xs text-caption text-gray-500">
                New investor interest and updates will show up here as they happen.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
