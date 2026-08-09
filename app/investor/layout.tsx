import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUserProfile, roleHomePath } from "@/lib/auth/session";
import { signOutAction } from "@/lib/auth/actions";
import { Logo } from "@/components/shared/logo";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
      <header className="border-border border-b bg-white">
        <Container className="flex h-16 items-center justify-between">
          <Logo href="/investor" />
          <div className="flex items-center gap-4">
            <Link
              href="/investor/profile"
              className="text-small flex items-center gap-2 text-gray-500 hover:text-gray-900"
            >
              <Avatar className="size-7">
                <AvatarImage
                  src={current.profile.avatar_url ?? undefined}
                  alt=""
                />
                <AvatarFallback className="text-caption">
                  {current.profile.full_name.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {current.profile.full_name}
            </Link>
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
