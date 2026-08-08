import { redirect } from "next/navigation";

import { getCurrentUserProfile, roleHomePath } from "@/lib/auth/session";
import { signOutAction } from "@/lib/auth/actions";
import { Logo } from "@/components/shared/logo";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";

/**
 * Everything under /investor requires a signed-in user whose profile role
 * is exactly 'investor'. See app/founder/layout.tsx for the mirrored
 * founder-side rationale.
 */
export default async function InvestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const current = await getCurrentUserProfile();

  if (!current) redirect("/login?next=/investor");
  if (current.profile.role !== "investor") {
    redirect(roleHomePath(current.profile.role));
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border bg-white">
        <Container className="flex h-16 items-center justify-between">
          <Logo href="/investor" />
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
