import { redirect } from "next/navigation";

import { getCurrentUserProfile, roleHomePath } from "@/lib/auth/session";
import { FounderSidebar } from "@/components/founder/sidebar";
import { FounderTopBar } from "@/components/founder/topbar";

/**
 * The Sprint 4 Founder application shell:
 *
 *   ApplicationShell
 *   ├── Sidebar        (components/founder/sidebar.tsx)
 *   ├── TopBar          (components/founder/topbar.tsx)
 *   └── children         — the currently routed workspace section
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

  return (
    <div className="flex min-h-svh bg-gray-50">
      <FounderSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <FounderTopBar
          fullName={current.profile.full_name}
          avatarUrl={current.profile.avatar_url}
        />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
