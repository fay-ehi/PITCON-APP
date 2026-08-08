import { redirect } from "next/navigation";

import { getCurrentUserProfile, roleHomePath } from "@/lib/auth/session";
import { signOutAction } from "@/lib/auth/actions";
import { Logo } from "@/components/shared/logo";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";

/**
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

  if (!current) redirect("/login?next=/founder");
  if (current.profile.role !== "founder") {
    redirect(roleHomePath(current.profile.role));
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border bg-white">
        <Container className="flex h-16 items-center justify-between">
          <Logo href="/founder" />
          <div className="flex items-center gap-4">
            <span className="text-small text-gray-500">
              {current.profile.full_name}
            </span>
            <form action={signOutAction}>
              <Button type="submit" variant="secondary" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </Container>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
