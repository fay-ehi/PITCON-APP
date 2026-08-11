import Link from "next/link";
import { Heart } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatRelativeDate } from "@/lib/format/date";
import type { NotificationSummary } from "@/types/notification";

/**
 * The real notification feed for `/founder/notifications` and
 * `/investor/notifications` - shared since both pages read through the
 * same `notifications` table (see lib/queries/notifications.ts) and
 * differ only in which role's events land there. Every row here was
 * created by one of the Sprint 6 `startup_interests` triggers, so
 * `Heart` (matching Founder's existing sidebar Interests icon and the
 * Investor "My Interests" icon) is the one icon this needs for now -
 * not a per-type icon map for notification kinds that don't exist yet.
 *
 * Unread rows are visually distinguished (a filled dot + slightly
 * tinted background) using the snapshot each page fetched *before*
 * `MarkNotificationsRead` fired - so a first visit still shows which
 * notifications were new, even though they're marked read moments
 * later for the next visit's badge count.
 */
function NotificationList({ notifications }: { notifications: NotificationSummary[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {notifications.map((notification) => (
        <li key={notification.id}>
          <Link
            href={notification.linkPath}
            className={cn(
              "flex items-start gap-3 rounded-card border border-border p-4 transition-colors hover:border-gray-300 hover:bg-gray-50",
              !notification.isRead && "bg-primary-50/40",
            )}
          >
            <div className="mt-1.5 flex size-2 shrink-0 items-center justify-center">
              {!notification.isRead && (
                <span
                  aria-label="Unread"
                  className="bg-primary size-2 shrink-0 rounded-pill"
                />
              )}
            </div>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-pill bg-primary-50">
              <Heart className="text-primary size-4" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-small font-medium text-gray-900">{notification.title}</p>
              <p className="text-small text-gray-500">{notification.body}</p>
              <p className="text-caption mt-1 text-gray-400">
                {formatRelativeDate(notification.createdAt)}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export { NotificationList };
