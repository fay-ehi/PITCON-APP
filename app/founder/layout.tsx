import { redirect } from "next/navigation";
import * as Sentry from "@sentry/nextjs";

import { getCurrentUserProfile, roleHomePath } from "@/lib/auth/session";
import { getUnreadNotificationCount } from "@/lib/queries/notifications";
import { getFounderUnreadConversationCount } from "@/lib/queries/messages";
import { FounderShell } from "@/components/founder/shell";

/**
 * The Sprint 4 Founder application shell:
 *
 *   ApplicationShell
 *   └── FounderShell      (components/founder/shell.tsx) — client wrapper
 *       ├── Sidebar        (components/founder/sidebar.tsx)
 *       ├── TopBar          (components/founder/topbar.tsx)
 *       └── children         — the currently routed workspace section
 *
 * This layout stays a server component (it fetches the profile + unread
 * counts below), so the mobile nav drawer's open/closed state lives one
 * level down in `FounderShell`, a client component that owns that state
 * and passes it to Sidebar/TopBar as props.
 *
 * Per the brief, this whole layout *is* the Founder dashboard - there is
 * no separate "/founder dashboard" page with its own widgets. Every
 * section under /founder (My Startups, Messages, Interests,
 * Notifications, Settings, Founder Profile) renders as `children` here,
 * inside the same persistent sidebar/top-bar frame, so switching
 * sections is a route change, not a client-side visibility toggle - real
 * URLs, working browser back/forward, and refresh-preserves-section all
 * fall out of that for free.
 *
 * Everything under /founder requires a signed-in user whose profile role
 * is exactly 'founder'. proxy.ts already redirects signed-out visitors
 * away before this ever runs; this layout is what enforces the
 * founder-vs-investor distinction, and re-checks "signed in at all" too
 * so this route group is fully self-protecting even if proxy.ts's
 * matcher ever changes.
 */
export default async function FounderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const current = await getCurrentUserProfile();

  if (!current) redirect("/login?next=/founder/startups");
  if (current.profile.role !== "founder") {
    redirect(roleHomePath(current.profile.role));
  }

  // Added in the pre-launch hardening pass - lets a Sentry event be
  // traced back to an account without attaching anything more (no
  // email, no IP - see sendDefaultPii: false in instrumentation-client.ts).
  Sentry.setUser({ id: current.userId });

  const [unreadNotificationCount, unreadMessageCount] = await Promise.all([
    getUnreadNotificationCount(current.userId),
    getFounderUnreadConversationCount(current.userId),
  ]);

  return (
    <FounderShell
      unreadMessageCount={unreadMessageCount}
      fullName={current.profile.full_name}
      avatarUrl={current.profile.avatar_url}
      unreadNotificationCount={unreadNotificationCount}
    >
      {children}
    </FounderShell>
  );
}
