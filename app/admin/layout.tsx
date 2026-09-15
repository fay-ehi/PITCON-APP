import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

import { checkAdminAccess } from "@/lib/admin/auth";

/**
 * Admin shell, added in the pre-launch hardening pass (the audit's
 * "no way to see what's happening on the platform without querying
 * Supabase directly"). Gated by `lib/admin/auth.ts`'s email allowlist -
 * see that file for why this is intentionally simple rather than a
 * full `admin` role.
 *
 * Signed-out visitors go to /login same as every other protected area.
 * A signed-in user who just isn't on the allowlist gets a plain 404
 * instead of a "you don't have access" page - no confirmation that
 * `/admin` exists at all to someone who isn't supposed to know.
 *
 * The nav row was added in Sprint 17, once a fourth page (the
 * activation funnel) made "everything reachable from a link somewhere
 * on the dashboard body" start to feel like the wrong shape - plain
 * `<Link>`s, no active-route highlighting, since this stays a Server
 * Component and that would need a Client Component just for
 * `usePathname()`. Not worth it yet for four links.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await checkAdminAccess();

  if (access.status === "signed_out") redirect("/login?next=/admin");
  if (access.status === "forbidden") notFound();

  Sentry.setUser({ id: access.session.userId, email: access.session.email });

  return (
    <div className="min-h-svh bg-gray-50">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-content items-center justify-between px-4 py-4 sm:px-6">
          <span className="text-h3 font-semibold text-gray-900">
            PITCON <span className="text-primary">Admin</span>
          </span>
          <span className="text-small text-gray-500">{access.session.email}</span>
        </div>
        <nav className="mx-auto flex max-w-content gap-4 px-4 pb-3 sm:px-6">
          <Link href="/admin" className="text-small text-gray-600 hover:text-gray-900">
            Overview
          </Link>
          <Link href="/admin/users" className="text-small text-gray-600 hover:text-gray-900">
            Users
          </Link>
          <Link href="/admin/reports" className="text-small text-gray-600 hover:text-gray-900">
            Reports
          </Link>
          <Link href="/admin/funnel" className="text-small text-gray-600 hover:text-gray-900">
            Funnel
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-content px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
