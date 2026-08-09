import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUserProfile, roleHomePath } from "@/lib/auth/session";
import { signOutAction } from "@/lib/auth/actions";
import { Logo } from "@/components/shared/logo";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
      <header className="border-border border-b bg-white">
        <Container className="flex h-16 items-center justify-between">
          <Logo href="/founder" />
          <div className="flex items-center gap-4">
            <Link
              href="/founder/profile"
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
