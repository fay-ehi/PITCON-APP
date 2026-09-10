import Link from "next/link";

import { Container } from "@/components/shared/container";
import { Logo } from "@/components/shared/logo";

type FooterLink = { href: string; label: string };

const PLATFORM_LINKS: FooterLink[] = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#for-founders", label: "For Founders" },
  { href: "#for-investors", label: "For Investors" },
  { href: "#faq", label: "FAQ" },
];

const ACCOUNT_LINKS: FooterLink[] = [
  { href: "/login", label: "Log in" },
  { href: "/signup?role=founder", label: "Sign up as a Founder" },
  { href: "/signup?role=investor", label: "Sign up as an Investor" },
];

/**
 * The landing page footer (Sprint 11 brief: branding, relevant
 * navigation, login/signup paths, "any legitimate links already
 * supported by the project" - and explicitly no fake social accounts
 * or contact info).
 *
 * Every link here either points to an in-page anchor already rendered
 * on this same page, or a real route that exists in the app (/login,
 * /signup). No /about, /contact, /pricing, or social links - the
 * Product Vision doc's "Marketing Website" section lists those as part
 * of the broader vision, but they're not implemented routes, and a
 * footer link to a page that doesn't exist would fail the brief's own
 * "Navigation and CTA routes work correctly" requirement.
 */
function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-border border-t bg-white">
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="text-caption mt-3 max-w-64 text-gray-500">
              Where African ambition becomes funded and structured.
            </p>
          </div>

          <FooterColumn title="Platform" links={PLATFORM_LINKS} />
          <FooterColumn title="Account" links={ACCOUNT_LINKS} />
        </div>

        <div className="border-border mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <p className="text-caption text-gray-400">
            &copy; {year} PITCON. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: FooterLink[];
}) {
  return (
    <div>
      <p className="text-caption font-semibold tracking-wide text-gray-900 uppercase">
        {title}
      </p>
      <ul className="mt-3 flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-small text-gray-500 transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { SiteFooter };
