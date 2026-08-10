import type { Metadata } from "next";
import { Bell } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Notifications",
};

/**
 * Notifications destination for the Investor top bar's bell
 * (components/investor/topbar.tsx) - see the Sprint 5 brief's
 * "NOTIFICATION INDICATOR". No `notifications` table exists yet, so
 * there's nothing to feed a real feed with (new founder messages,
 * startup updates from founders you've interacted with, etc. once
 * those features exist). Mirrors app/founder/notifications/page.tsx:
 * renders the genuine "no notifications yet" state rather than
 * fabricated entries.
 *
 * The top bar's bell intentionally carries no unread-count badge for
 * the same reason.
 */
export default function InvestorNotificationsPage() {
  return (
    <Container className="py-10 sm:py-12">
      <h1 className="text-h2 text-gray-900">Notifications</h1>
      <p className="mt-1 text-small text-gray-500">
        Messages and updates from founders you&apos;ve connected with.
      </p>

      <Card className="mt-8">
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-pill bg-primary-50">
            <Bell className="size-6 text-primary" aria-hidden />
          </div>
          <div>
            <p className="text-small font-medium text-gray-900">No notifications yet</p>
            <p className="mt-1 max-w-xs text-caption text-gray-500">
              New messages and updates will show up here as they happen.
            </p>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
