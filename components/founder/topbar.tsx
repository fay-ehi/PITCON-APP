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
import { signOutAction } from "@/lib/auth/actions";

/**
 * The restrained top-right account area (Sprint 4 brief: "Keep a
 * restrained top-right account area" - notification indicator + avatar
 * + account menu, nothing else). Deliberately doesn't render a page
 * title or breadcrumb: each workspace section already opens with its
 * own heading (e.g. "My Startups"), so this stays out of that section's
 * way rather than duplicating it.
 *
 * There is no unread-count badge on the bell: Notifications has no data
 * model behind it yet (see app/founder/notifications/page.tsx), and a
 * fabricated badge would be exactly the kind of fake data the brief
 * explicitly rules out.
 */
function FounderTopBar({
  fullName,
  avatarUrl,
}: {
  fullName: string;
  avatarUrl: string | null;
}) {
  const initial = fullName.trim().slice(0, 1).toUpperCase() || "F";

  return (
    <header className="border-border sticky top-0 z-10 flex h-16 shrink-0 items-center justify-end gap-1 border-b bg-white px-4 sm:px-6">
      <Link
        href="/founder/notifications"
        aria-label="Notifications"
        className="rounded-control flex size-10 items-center justify-center text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
      >
        <Bell className="size-5" aria-hidden />
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
