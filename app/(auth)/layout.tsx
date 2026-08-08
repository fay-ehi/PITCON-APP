import * as React from "react";

import { AuthCloseButton } from "@/components/shared/auth-close-button";
import { Logo } from "@/components/shared/logo";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Hero } from "@/components/marketing/hero";

/**
 * Shared shell for every authentication screen (login, signup, forgot
 * password, reset password, verify email).
 *
 * `{children}` is mounted exactly once — the surrounding chrome adapts
 * responsively instead of rendering two full copies of the form and
 * toggling them with `lg:hidden` / `hidden lg:block`. (An earlier version
 * did that; it meant every form on the page existed twice in the DOM at
 * once, with duplicate element `id`s, which broke `<label htmlFor>`
 * association and let browser autofill / password managers target the
 * wrong, invisible copy. Don't reintroduce that pattern here.)
 *
 * Mobile (< lg): simple stacked layout, a small logo header above the
 * form, full width, no backdrop.
 *
 * Desktop (lg+): the actual marketing homepage rendered full-screen and
 * blurred behind a dimming overlay, with the form floating in a white
 * card centered on top, matching the "auth over a blurred landing page"
 * reference screenshot. The blurred content is real (SiteHeader + Hero +
 * SiteFooter), not a placeholder graphic, so it stays accurate as the
 * marketing page evolves. It's `aria-hidden` and `pointer-events-none`
 * since it's purely decorative here, not a real interactive page.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col lg:block lg:min-h-svh">
      {/* Mobile-only logo header. */}
      <header className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-6 lg:hidden">
        <Logo />
        <AuthCloseButton className="-mr-2" />
      </header>

      {/* Desktop-only blurred landing page backdrop. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 hidden overflow-hidden blur-md select-none lg:block"
      >
        <div className="flex min-h-full flex-col">
          <SiteHeader />
          <main className="flex-1">
            <Hero />
          </main>
          <SiteFooter />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 hidden bg-white/55 lg:block"
      />

      {/* Single content mount point: plain centered column on mobile,
          floating white card over the blurred backdrop on desktop. */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:min-h-svh lg:flex-none lg:overflow-y-auto lg:p-8">
        <div className="relative w-full max-w-104 lg:rounded-2xl lg:border lg:border-border lg:bg-white lg:p-8 lg:shadow-xl">
          <AuthCloseButton className="absolute right-4 top-4 hidden lg:inline-flex" />
          {children}
        </div>
      </div>
    </div>
  );
}
