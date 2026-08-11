"use client";

import Link from "next/link";
import { Bell, Heart, LogOut, MessageSquare, Settings as SettingsIcon, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/shared/logo";
import { Container } from "@/components/shared/container";
import { UnreadBadge } from "@/components/shared/unread-badge";
import { signOutAction } from "@/lib/auth/actions";

/**
 * The Investor top bar - a clean header, not a sidebar, per the Sprint
 * 5 brief's "INVESTOR APPLICATION STRUCTURE" ("Do not create a
 * Founder-style sidebar for Investors"). Unlike `FounderTopBar` (which
 * sits inside a sidebar layout and only needs its own right-aligned
 * controls), this is the Investor app's entire persistent chrome, so it
 * also carries the logo on the left - see the brief's top-bar mockup.
 *
 * As of Sprint 6:
 *   - a "My Interests" icon joins Messages/Notifications. The brief's
 *     Sprint 5 top-bar mockup ("💬 🔔 [Avatar]") predates My Interests
 *     existing at all - Sprint 6 explicitly leaves its placement up to
 *     this sprint ("create an appropriate Investor Interests destination
 *     without introducing a sidebar"). A persistent top-bar icon,
 *     alongside the other two global-utility destinations, is that
 *     placement, rather than extending the already-specified avatar menu
 *     (Investor Name / Investor Profile / Settings / Log out) with a
 *     fifth, unrelated entry.
 *   - the Notifications bell carries a real unread-count badge -
 *     `unreadNotificationCount` is fetched server-side in
 *     app/investor/layout.tsx (see lib/queries/notifications.ts) now
 *     that Notifications has a real data model behind it. `UnreadBadge`
 *     renders nothing at zero, so this is visually identical to before
 *     Sprint 6 whenever there's nothing unread. Messages still has no
 *     badge - it has no data model behind it yet, same reasoning as
 *     before this sprint.
 */
function InvestorTopBar({
  fullName,
  avatarUrl,
  unreadNotificationCount,
}: {
  fullName: string;
  avatarUrl: string | null;
  unreadNotificationCount: number;
}) {
  const initial = fullName.trim().slice(0, 1).toUpperCase() || "I";

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-white">
      <Container className="flex h-16 items-center justify-between">
        <Logo href="/investor/discover" />

        <div className="flex items-center gap-1">
          <Link
            href="/investor/interests"
            aria-label="My Interests"
            className="flex size-10 items-center justify-center rounded-control text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <Heart className="size-5" aria-hidden />
          </Link>
          <Link
            href="/investor/messages"
            aria-label="Messages"
            className="flex size-10 items-center justify-center rounded-control text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <MessageSquare className="size-5" aria-hidden />
          </Link>
          <Link
            href="/investor/notifications"
            aria-label={
              unreadNotificationCount > 0
                ? `Notifications, ${unreadNotificationCount} unread`
                : "Notifications"
            }
            className="relative flex size-10 items-center justify-center rounded-control text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <Bell className="size-5" aria-hidden />
            <UnreadBadge count={unreadNotificationCount} />
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="ml-1 flex items-center gap-2 rounded-control p-1 pr-2 outline-none transition-colors hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-primary/30">
              <Avatar className="size-8">
                <AvatarImage src={avatarUrl ?? undefined} alt="" />
                <AvatarFallback className="text-caption">{initial}</AvatarFallback>
              </Avatar>
              <span className="sr-only">Open account menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="truncate text-small font-medium text-gray-900">
                {fullName}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/investor/profile">
                  <User /> Investor Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/investor/settings">
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
        </div>
      </Container>
    </header>
  );
}

export { InvestorTopBar };
