"use client";

import Link from "next/link";
import { Bell, LogOut, MessageSquare, Settings as SettingsIcon, User } from "lucide-react";

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
import { signOutAction } from "@/lib/auth/actions";

/**
 * The Investor top bar - a clean header, not a sidebar, per the Sprint
 * 5 brief's "INVESTOR APPLICATION STRUCTURE" ("Do not create a
 * Founder-style sidebar for Investors"). Unlike `FounderTopBar` (which
 * sits inside a sidebar layout and only needs its own right-aligned
 * controls), this is the Investor app's entire persistent chrome, so it
 * also carries the logo on the left - see the brief's top-bar mockup.
 *
 * There are no unread-count badges on Messages/Notifications: neither
 * has a data model behind it yet (see app/investor/messages/page.tsx
 * and app/investor/notifications/page.tsx), and a fabricated badge
 * would be exactly the kind of fake data the brief rules out ("Do not
 * duplicate notifications inside Discover unnecessarily" / no fake
 * popularity or engagement signals anywhere in this sprint).
 */
function InvestorTopBar({
  fullName,
  avatarUrl,
}: {
  fullName: string;
  avatarUrl: string | null;
}) {
  const initial = fullName.trim().slice(0, 1).toUpperCase() || "I";

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-white">
      <Container className="flex h-16 items-center justify-between">
        <Logo href="/investor/discover" />

        <div className="flex items-center gap-1">
          <Link
            href="/investor/messages"
            aria-label="Messages"
            className="flex size-10 items-center justify-center rounded-control text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <MessageSquare className="size-5" aria-hidden />
          </Link>
          <Link
            href="/investor/notifications"
            aria-label="Notifications"
            className="flex size-10 items-center justify-center rounded-control text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <Bell className="size-5" aria-hidden />
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
