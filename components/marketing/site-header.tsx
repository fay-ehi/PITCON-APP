import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { Logo } from "@/components/shared/logo";
import { MobileNav } from "@/components/marketing/mobile-nav";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#for-founders", label: "For Founders" },
  { href: "#for-investors", label: "For Investors" },
  { href: "#faq", label: "FAQ" },
];

/**
 * The public landing page's top navigation (Sprint 11 brief: clean,
 * minimal, a small number of useful links, Founder CTA, Investor CTA,
 * Login - "do not overcrowd").
 *
 * Sticky, with a translucent/blurred backdrop, so the nav (and its
 * signup CTAs) stay reachable while scrolling through the long landing
 * page - the one piece of "visual depth" the marketing site is allowed
 * that the application chrome deliberately isn't (see the Design
 * System doc's "the marketing site can use more visual depth than the
 * application").
 *
 * Also reused, unchanged, as the blurred backdrop behind desktop auth
 * screens (app/(auth)/layout.tsx) - still a plain no-props component
 * for that reuse to keep working. `MobileNav` is a self-contained
 * client component so this file itself stays a server component.
 */
function SiteHeader() {
  return (
    <header className="border-border sticky top-0 z-30 border-b bg-white/90 backdrop-blur-sm">
      <Container className="relative flex h-16 items-center justify-between">
        <Logo />

        <nav
          aria-label="Landing page sections"
          className="hidden items-center gap-1 lg:flex"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-control text-small px-3 py-2 font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/signup?role=investor">I&apos;m an Investor</Link>
          </Button>
          <Button variant="primary" size="sm" asChild>
            <Link href="/signup?role=founder">I&apos;m a Founder</Link>
          </Button>
        </div>

        <MobileNav />
      </Container>
    </header>
  );
}

export { SiteHeader };
