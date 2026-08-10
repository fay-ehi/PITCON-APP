import { Bell, Building2, Heart, MessageSquare, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type FounderNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

/**
 * The Founder workspace's persistent sidebar - answers "where can I go?"
 * (as distinct from the main workspace, which answers "what am I doing
 * here?"). Deliberately has no "Dashboard" entry: per the Sprint 4
 * brief, the entire Founder application *is* the dashboard, and My
 * Startups is just its default section. Single source of truth for both
 * the desktop (icon + label) and compact/mobile (icon-only, tooltip)
 * sidebar renderings in `sidebar.tsx`.
 */
export const FOUNDER_NAV_ITEMS: FounderNavItem[] = [
  { href: "/founder/startups", label: "My Startups", icon: Building2 },
  { href: "/founder/messages", label: "Messages", icon: MessageSquare },
  { href: "/founder/interests", label: "Interests", icon: Heart },
  { href: "/founder/notifications", label: "Notifications", icon: Bell },
];

/** Rendered separately, below a divider - see the ASCII sidebar mockup
 * in the Sprint 4 brief (Settings sits under a "────────" rule, apart
 * from the four primary sections above). */
export const FOUNDER_SETTINGS_NAV_ITEM: FounderNavItem = {
  href: "/founder/settings",
  label: "Settings",
  icon: Settings,
};
