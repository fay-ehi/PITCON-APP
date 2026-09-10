"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#for-founders", label: "For Founders" },
  { href: "#for-investors", label: "For Investors" },
  { href: "#faq", label: "FAQ" },
];

/**
 * The marketing header's mobile navigation (Sprint 11 brief: "adapt
 * elegantly on mobile" - not a hamburger drawer for the *application*
 * sidebar, per the Founder workspace's explicit "do NOT implement a
 * hamburger navigation drawer" rule, but this is the public marketing
 * nav, a different surface with a different constraint: a small number
 * of anchor links plus three CTAs (Login, Investor, Founder) genuinely
 * don't fit in one compact row at phone widths the way the always-icon
 * -visible app sidebar does.
 *
 * A single toggle button + slide-down panel, built with plain
 * `useState` (no new dependency) - same weight class as the rest of
 * this component tree's lightweight client components (e.g.
 * DiscoverControls).
 */
function MobileNav() {
  const [open, setOpen] = React.useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        className="rounded-control flex size-10 items-center justify-center text-gray-700 transition-colors hover:bg-gray-100"
      >
        {open ? (
          <X className="size-5" aria-hidden />
        ) : (
          <Menu className="size-5" aria-hidden />
        )}
      </button>

      {open && (
        <div
          id="mobile-nav-panel"
          className="border-border shadow-medium animate-in fade-in slide-in-from-top-2 absolute inset-x-0 top-full z-30 border-b bg-white p-4 duration-200 motion-reduce:animate-none"
        >
          <nav aria-label="Landing page sections" className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className="rounded-control text-small px-3 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="border-border mt-3 flex flex-col gap-2 border-t pt-3">
            <Button variant="ghost" asChild>
              <Link href="/login" onClick={close}>
                Log in
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/signup?role=investor" onClick={close}>
                I&apos;m an Investor
              </Link>
            </Button>
            <Button asChild>
              <Link href="/signup?role=founder" onClick={close}>
                I&apos;m a Founder
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export { MobileNav };
