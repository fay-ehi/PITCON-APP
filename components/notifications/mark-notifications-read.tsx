"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { markAllNotificationsReadAction } from "@/lib/notifications/notification-actions";

/**
 * Fires once, on mount, whenever either Notifications page is visited -
 * marks every currently-unread notification read, then `router.refresh()`
 * so the top-bar bell badge (fetched server-side in the surrounding
 * layout) picks up the new, lower unread count without a full page
 * reload. Renders nothing; the `useRef` guard keeps this from re-firing
 * on a client-side re-render of the same page instance (e.g. after the
 * refresh it triggers).
 */
function MarkNotificationsRead() {
  const router = useRouter();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    void markAllNotificationsReadAction().then((result) => {
      if (result.success) router.refresh();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export { MarkNotificationsRead };
