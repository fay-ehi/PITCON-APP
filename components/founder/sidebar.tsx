"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import {
  FOUNDER_NAV_ITEMS,
  FOUNDER_SETTINGS_NAV_ITEM,
  type FounderNavItem,
} from "@/components/founder/nav-items";
import { UnreadBadge } from "@/components/shared/unread-badge";

/**
 * The Founder workspace's persistent navigation - "Where can I go?" (see
 * the Sprint 4 brief's "IMPORTANT NAVIGATION PRINCIPLE"). One component
 * handles both the desktop rendering (icon + label, ~15rem wide) and the
 * compact/mobile rendering (icon-only, ~4rem, Pinterest-style) purely
 * through the `lg:` breakpoint - there is no JS-driven collapse and,
 * per the brief's explicit "do NOT implement a hamburger navigation
 * drawer," no hamburger/drawer/bottom-tab-bar variant exists at any
 * width. The sidebar is always visible; only its width and whether
 * labels are painted changes.
 *
 * As of Sprint 7, Messages carries a real unread-count badge -
 * `unreadMessageCount` is fetched server-side in app/founder/layout.tsx
 * (see `getFounderUnreadConversationCount`), same "fetched once per
 * layout render, `UnreadBadge` renders nothing at zero" shape as
 * Notifications' bell badge in `FounderTopBar`.
 */
function FounderSidebar({
  unreadMessageCount,
}: {
  unreadMessageCount: number;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside
      aria-label="Founder navigation"
      className="border-border sticky top-0 z-20 flex h-svh w-16 shrink-0 flex-col border-r bg-white lg:w-60"
    >
      <Link
        href="/founder/startups"
        className="border-border flex h-16 shrink-0 items-center justify-center border-b px-2 lg:justify-start lg:px-5"
      >
        <span className="text-h3 text-primary font-bold lg:hidden" aria-hidden>
          P
        </span>
        <span className="text-h3 hidden font-bold text-gray-900 lg:inline">
          PIT<span className="text-primary">CON</span>
        </span>
        <span className="sr-only">PITCON — My Startups</span>
      </Link>

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
        "group rounded-control relative flex items-center justify-center gap-3 px-3 py-2.5 transition-colors lg:justify-start",
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
          "text-small hidden truncate lg:inline",
          active ? "font-semibold" : "font-medium",
        )}
      >
        {item.label}
      </span>
      <span className="sr-only lg:hidden">{label}</span>

      {/* Hover/focus tooltip for the icon-only compact rendering — the
          sr-only span above already covers screen readers, so this is
          marked aria-hidden to avoid the label being announced twice. */}
      <span
        aria-hidden="true"
        className="rounded-control text-caption shadow-medium pointer-events-none absolute left-full z-30 ml-2 bg-gray-900 px-2 py-1 whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 lg:hidden"
      >
        {label}
      </span>
    </Link>
  );
}

export { FounderSidebar };
