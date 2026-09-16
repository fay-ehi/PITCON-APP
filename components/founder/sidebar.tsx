"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  FOUNDER_NAV_ITEMS,
  FOUNDER_SETTINGS_NAV_ITEM,
  type FounderNavItem,
} from "@/components/founder/nav-items";
import { UnreadBadge } from "@/components/shared/unread-badge";

/**
 * The Founder workspace's persistent navigation - "Where can I go?" (see
 * the Sprint 4 brief's "IMPORTANT NAVIGATION PRINCIPLE").
 *
 * UPDATED (mobile nav revamp): below `lg` this is now a JS-driven
 * off-canvas drawer instead of the old always-visible icon-only rail -
 * closed by default, opened via the hamburger button in
 * `FounderTopBar`, and closed again on backdrop click, the X button, or
 * navigating to a new route. `isOpen`/`onClose` are lifted up into
 * `FounderShell` so the topbar's hamburger and this drawer share one
 * source of truth. At `lg` and above the drawer behavior is inert
 * (`lg:translate-x-0 lg:sticky`) and the sidebar renders exactly as
 * before: a permanent w-60 rail with icon + label.
 *
 * The logo now always renders the full "PITCON" wordmark - there's no
 * more icon-only compact state to abbreviate it for.
 *
 * As of Sprint 7, Messages carries a real unread-count badge -
 * `unreadMessageCount` is fetched server-side in app/founder/layout.tsx
 * (see `getFounderUnreadConversationCount`), same "fetched once per
 * layout render, `UnreadBadge` renders nothing at zero" shape as
 * Notifications' bell badge in `FounderTopBar`.
 */
function FounderSidebar({
  unreadMessageCount,
  isOpen,
  onClose,
}: {
  unreadMessageCount: number;
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // Auto-close the mobile drawer whenever the route changes (tapping a
  // nav link should navigate AND collapse the drawer, not leave it open
  // over the new page).
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {/* Backdrop - mobile only, click-to-close, invisible/inert at lg+ */}
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-30 bg-gray-900/40 transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        aria-label="Founder navigation"
        className={cn(
          "border-border fixed inset-y-0 left-0 z-40 flex h-svh w-60 shrink-0 -translate-x-full flex-col border-r bg-white transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:z-20 lg:translate-x-0",
          isOpen && "translate-x-0",
        )}
      >
        <div className="border-border flex h-16 shrink-0 items-center justify-between border-b px-5">
          <Link
            href="/founder/startups"
            className="flex items-center"
            aria-label="PITCON — My Startups"
          >
            <span className="text-h3 font-bold text-gray-900">
              PIT<span className="text-primary">CON</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-control -mr-1.5 flex size-9 items-center justify-center text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 lg:hidden"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-4">
          {FOUNDER_NAV_ITEMS.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              active={isActive(item.href)}
              badgeCount={
                item.href === "/founder/messages" ? unreadMessageCount : 0
              }
            />
          ))}
        </nav>

        <div className="border-border shrink-0 border-t px-2 py-3">
          <SidebarLink
            item={FOUNDER_SETTINGS_NAV_ITEM}
            active={isActive(FOUNDER_SETTINGS_NAV_ITEM.href)}
          />
        </div>
      </aside>
    </>
  );
}

function SidebarLink({
  item,
  active,
  badgeCount = 0,
}: {
  item: FounderNavItem;
  active: boolean;
  badgeCount?: number;
}) {
  const Icon = item.icon;
  const label =
    badgeCount > 0 ? `${item.label}, ${badgeCount} unread` : item.label;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      aria-label={badgeCount > 0 ? label : undefined}
      className={cn(
        "group rounded-control relative flex items-center gap-3 px-3 py-2.5 transition-colors",
        active
          ? "bg-primary-50 text-primary-700"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
      )}
    >
      {/* A visible left accent bar on the active item — status here is
          never conveyed by background color alone (see the brief's
          accessibility requirement not to rely on color alone for the
          selected nav item). */}
      <span
        aria-hidden
        className={cn(
          "bg-primary-500 absolute inset-y-1.5 left-0 w-0.5 rounded-full transition-opacity",
          active ? "opacity-100" : "opacity-0",
        )}
      />
      <span className="relative flex shrink-0 items-center justify-center">
        <Icon className="size-5 shrink-0" aria-hidden />
        <UnreadBadge count={badgeCount} className="-top-1.5 -right-1.5" />
      </span>
      <span
        className={cn(
          "text-small truncate",
          active ? "font-semibold" : "font-medium",
        )}
      >
        {item.label}
      </span>
    </Link>
  );
}

export { FounderSidebar };
