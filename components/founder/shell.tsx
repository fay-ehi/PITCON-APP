"use client";

import { useState } from "react";

import { FounderSidebar } from "@/components/founder/sidebar";
import { FounderTopBar } from "@/components/founder/topbar";

/**
 * Thin client-side shell around the sidebar/topbar/content frame.
 *
 * `app/founder/layout.tsx` is a server component (it fetches the
 * profile + unread counts), so the open/closed state for the mobile
 * nav drawer can't live there. This component exists purely to own
 * that one piece of state and hand it to both `FounderSidebar` (the
 * drawer itself) and `FounderTopBar` (the hamburger that opens it) -
 * they're siblings, so the state has to live one level up.
 */
function FounderShell({
  unreadMessageCount,
  fullName,
  avatarUrl,
  unreadNotificationCount,
  children,
}: {
  unreadMessageCount: number;
  fullName: string;
  avatarUrl: string | null;
  unreadNotificationCount: number;
  children: React.ReactNode;
}) {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <div className="flex min-h-svh bg-gray-50">
      <FounderSidebar
        unreadMessageCount={unreadMessageCount}
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <FounderTopBar
          fullName={fullName}
          avatarUrl={avatarUrl}
          unreadNotificationCount={unreadNotificationCount}
          onMenuClick={() => setIsNavOpen(true)}
        />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

export { FounderShell };
