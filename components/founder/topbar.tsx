"use client";

import Link from "next/link";
import { Bell, LogOut, Settings as SettingsIcon, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UnreadBadge } from "@/components/shared/unread-badge";
import { signOutAction } from "@/lib/auth/actions";

/**
 * The restrained top-right account area (Sprint 4 brief: "Keep a
 * restrained top-right account area" - notification indicator + avatar
 * + account menu, nothing else). Deliberately doesn't render a page
 * title or breadcrumb: each workspace section already opens with its
 * own heading (e.g. "My Startups"), so this stays out of that section's
 * way rather than duplicating it.
 *
 * As of Sprint 6, the bell carries a real unread-count badge -
 * `unreadNotificationCount` is fetched server-side in
 * app/founder/layout.tsx (see lib/queries/notifications.ts) now that
 * Notifications has a real data model behind it (the Sprint 6 Interest
 * workflow). `UnreadBadge` renders nothing at zero, so this is visually
 * identical to before Sprint 6 whenever there's nothing unread.
 */
function FounderTopBar({
  fullName,
  avatarUrl,
  unreadNotificationCount,
}: {
  fullName: string;
  avatarUrl: string | null;
  unreadNotificationCount: number;
}) {
  const initial = fullName.trim().slice(0, 1).toUpperCase() || "F";

  return (
    <header className="border-border sticky top-0 z-10 flex h-16 shrink-0 items-center justify-end gap-1 border-b bg-white px-4 sm:px-6">
      <Link
        href="/founder/notifications"
        aria-label={
          unreadNotificationCount > 0
            ? `Notifications, ${unreadNotificationCount} unread`
            : "Notifications"
        }
        className="rounded-control relative flex size-10 items-center justify-center text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
      >
        <Bell className="size-5" aria-hidden />
        <UnreadBadge count={unreadNotificationCount} />
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-control focus-visible:ring-primary/30 ml-1 flex items-center gap-2 p-1 pr-2 transition-colors outline-none hover:bg-gray-100 focus-visible:ring-2">
          <Avatar className="size-8">
            <AvatarImage src={avatarUrl ?? undefined} alt="" />
            <AvatarFallback className="text-caption">{initial}</AvatarFallback>
          </Avatar>
          <span className="sr-only">Open account menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-small truncate font-medium text-gray-900">
            {fullName}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/founder/profile">
              <User /> Founder Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/founder/settings">
              <SettingsIcon /> Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => {
              void signOutAction();
            }}
          >
            <LogOut /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

export { FounderTopBar };
