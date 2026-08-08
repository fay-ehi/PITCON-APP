import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { Logo } from "@/components/shared/logo";

/**
 * Generic marketing header. Auth CTAs now link to the real /login and
 * /signup routes (added in the Authentication sprint).
 */
function SiteHeader() {
  return (
    <header className="border-b border-border bg-white">
      <Container className="flex h-16 items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button variant="primary" size="sm" asChild>
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </Container>
    </header>
  );
}

export { SiteHeader };
