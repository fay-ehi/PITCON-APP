import { redirect } from "next/navigation";

import { getCurrentUserProfile, roleHomePath } from "@/lib/auth/session";
import { getUnreadNotificationCount } from "@/lib/queries/notifications";
import { InvestorTopBar } from "@/components/investor/topbar";

/**
 * The Sprint 5 Investor application shell:
 *
 *   ApplicationShell
 *   ├── TopBar     (components/investor/topbar.tsx)
 *   └── children    — the currently routed workspace section
 *
 * Deliberately no sidebar - per the brief's "INVESTOR APPLICATION
 * STRUCTURE" ("the Investor application should NOT use a persistent
 * sidebar... Do not create a Founder-style sidebar for Investors").
 * The Investor's primary workspace is Discover
 * (app/investor/discover/page.tsx); Messages and Notifications are
 * global utility links in the top bar rather than sidebar items, same
 * as the Founder shell's rationale in app/founder/layout.tsx but
 * without the sidebar half of it.
 *
 * Everything under /investor requires a signed-in user whose profile
 * role is exactly 'investor'. See app/founder/layout.tsx for the
 * mirrored founder-side rationale (proxy.ts handles "signed out
 * entirely"; this layout is what enforces the founder-vs-investor
 * distinction, and re-checks "signed in at all" too so this route
 * group is fully self-protecting).
 */
export default async function InvestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const current = await getCurrentUserProfile();

  if (!current) redirect("/login?next=/investor/discover");
  if (current.profile.role !== "investor") {
    redirect(roleHomePath(current.profile.role));
  }

  const unreadNotificationCount = await getUnreadNotificationCount(current.userId);

  return (
    <div className="flex min-h-svh flex-col bg-gray-50">
      <InvestorTopBar
        fullName={current.profile.full_name}
        avatarUrl={current.profile.avatar_url}
        unreadNotificationCount={unreadNotificationCount}
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}
