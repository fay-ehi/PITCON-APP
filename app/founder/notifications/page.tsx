import type { Metadata } from "next";
import { Bell } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Notifications",
};

/**
 * Notifications workspace - a chronological event feed (investor
 * interest, new messages, publishing confirmations, startup updates,
 * account events), distinct from the detailed Interests record. No
 * `notifications` table exists yet, so there's nothing to feed a "Today
 * / Earlier" grouped list or a "Mark all as read" action with - both are
 * straightforward to add once notification-producing events (interest,
 * messaging) exist. Renders the real "no notifications yet" state
 * rather than fabricated entries, per the brief's "do not create fake
 * notifications just to populate the UI."
 *
 * The top bar's bell (`components/founder/topbar.tsx`) links here and
 * intentionally carries no unread-count badge for the same reason.
 */
export default function NotificationsPage() {
  return (
    <Container className="py-10 sm:py-12">
      <h1 className="text-h2 text-gray-900">Notifications</h1>
      <p className="text-small mt-1 text-gray-500">
        Investor interest, messages, and updates about your startups.
      </p>

      <Card className="mt-8">
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="rounded-pill bg-primary-50 flex size-14 items-center justify-center">
            <Bell className="text-primary size-6" aria-hidden />
          </div>
          <div>
            <p className="text-small font-medium text-gray-900">
              No notifications yet
            </p>
            <p className="text-caption mt-1 max-w-xs text-gray-500">
              Investor interest, new messages, and startup updates will show up
              here as they happen.
            </p>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
