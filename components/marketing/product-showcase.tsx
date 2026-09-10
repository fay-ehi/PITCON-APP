import type { ReactNode } from "react";
import {
  Bell,
  Building2,
  Heart,
  MessageSquare,
  Search,
  Settings,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/marketing/reveal";

/**
 * "Product in action" (Sprint 11 brief section 4). The brief asks to
 * "use the real implemented UI where possible" and to avoid "fake
 * screenshots that don't correspond to the product" - there's no
 * browser available to capture literal screenshots here, so instead
 * every mockup below is built from the same tokens, layout, copy voice,
 * and icon set as the real components it stands in for
 * (FounderSidebar's nav items, DiscoverControls' search+filter row,
 * StartupResultCard, InterestRow, ConversationList/MessageBubble) -
 * same approach as the onboarding tour's UI miniatures
 * (components/onboarding/tour-visuals.tsx), just at landing-page scale.
 * Everything here is inert and `aria-hidden`; the section heading and
 * copy carry the accessible content.
 *
 * Composition is asymmetric (a wide Founder Dashboard frame beside a
 * narrower Discover frame, then two staggered accent cards below)
 * rather than a flat screenshot grid, per the brief - done with grid
 * column spans and alternating margins rather than absolute
 * positioning, so it holds together at every width without needing a
 * browser to visually verify.
 */
function ProductShowcase() {
  return (
    <section className="py-16 sm:py-24">
      <Container width="wide">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-h1 text-gray-900">See it in action</h2>
          <p className="text-body-lg mt-4 text-gray-500">
            The real PITCON workspace — a founder&apos;s dashboard, an
            investor&apos;s Discover feed, and the moment they connect.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-5">
          <Reveal className="lg:col-span-3">
            <BrowserFrame path="/founder/startups" label="Founder Dashboard">
              <FounderDashboardMockup />
            </BrowserFrame>
          </Reveal>
          <Reveal delayMs={120} className="lg:col-span-2">
            <BrowserFrame path="/investor/discover" label="Investor Discover">
              <DiscoverMockup />
            </BrowserFrame>
          </Reveal>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <Reveal delayMs={220} className="sm:mt-6">
            <InterestMockup />
          </Reveal>
          <Reveal delayMs={320}>
            <MessagingMockup />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function BrowserFrame({
  path,
  label,
  children,
}: {
  path: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      aria-hidden="true"
      className="rounded-card border-border shadow-strong overflow-hidden border bg-white"
    >
      <div className="border-border flex items-center gap-3 border-b bg-gray-50 px-4 py-2.5">
        <span className="flex shrink-0 gap-1.5">
          <span className="bg-gray-300 size-2.5 rounded-pill" />
          <span className="bg-gray-300 size-2.5 rounded-pill" />
          <span className="bg-gray-300 size-2.5 rounded-pill" />
        </span>
        <span className="rounded-control border-border text-caption flex-1 truncate border bg-white px-3 py-1 text-gray-400">
          pitcon.app{path}
        </span>
      </div>
      <div className="sr-only">{label}</div>
      {children}
    </div>
  );
}

const FOUNDER_NAV_ICONS = [Building2, MessageSquare, Heart, Bell, Settings];

function FounderDashboardMockup() {
  return (
    <div className="flex h-64 sm:h-72">
      <div className="border-border bg-white flex w-12 shrink-0 flex-col items-center gap-3 border-r py-4">
        {FOUNDER_NAV_ICONS.map((Icon, index) => (
          <span
            key={index}
            className={cn(
              "rounded-control flex size-8 items-center justify-center",
              index === 0
                ? "bg-primary-50 text-primary"
                : "text-gray-300",
            )}
          >
            <Icon className="size-4" />
          </span>
        ))}
      </div>
      <div className="flex-1 overflow-hidden p-4">
        <p className="text-small font-semibold text-gray-900">
          My Startups
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <MiniStartupTile
            name="Voltra"
            meta="CleanTech · Seed"
            status="Published"
          />
          <MiniStartupTile
            name="Amara Foods"
            meta="AgriTech · MVP"
            status="Draft"
          />
        </div>
      </div>
    </div>
  );
}

function MiniStartupTile({
  name,
  meta,
  status,
}: {
  name: string;
  meta: string;
  status: "Published" | "Draft";
}) {
  return (
    <div className="rounded-card border-border flex flex-col gap-2 border p-3">
      <div className="flex items-center gap-2">
        <span className="rounded-control bg-gray-100 flex size-7 shrink-0 items-center justify-center">
          <Building2 className="text-gray-400 size-3.5" />
        </span>
        <p className="text-caption truncate font-semibold text-gray-900">
          {name}
        </p>
      </div>
      <p className="text-caption truncate text-gray-400">{meta}</p>
      <span
        className={cn(
          "rounded-pill text-caption w-fit px-2 py-0.5 font-medium",
          status === "Published"
            ? "bg-primary-50 text-primary-700"
            : "bg-gray-100 text-gray-600",
        )}
      >
        {status}
      </span>
    </div>
  );
}

function DiscoverMockup() {
  return (
    <div className="h-64 overflow-hidden p-4 sm:h-72">
      <div className="border-border text-caption flex items-center gap-2 rounded-input border bg-gray-50 px-3 py-2 text-gray-400">
        <Search className="size-3.5" />
        Search startups...
      </div>
      <div className="mt-2 flex gap-1.5">
        {["Industry", "Stage", "Country"].map((label) => (
          <span
            key={label}
            className="rounded-pill border-border text-caption border bg-white px-2.5 py-1 text-gray-500"
          >
            {label}
          </span>
        ))}
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <MiniResultRow
          name="Voltra"
          meta="CleanTech · Seed · Kenya"
          funding="$250,000"
          selected
        />
        <MiniResultRow
          name="Kesho Health"
          meta="HealthTech · Series A · Nigeria"
          funding="$1.2M"
        />
      </div>
    </div>
  );
}

function MiniResultRow({
  name,
  meta,
  funding,
  selected = false,
}: {
  name: string;
  meta: string;
  funding: string;
  selected?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-card flex items-center gap-2.5 border p-2.5",
        selected
          ? "border-primary bg-primary-50/40"
          : "border-border bg-white",
      )}
    >
      <span className="rounded-control bg-gray-100 flex size-8 shrink-0 items-center justify-center">
        <Building2 className="text-gray-400 size-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-caption truncate font-semibold text-gray-900">
          {name}
        </p>
        <p className="text-caption truncate text-gray-400">{meta}</p>
      </div>
      <p className="text-caption shrink-0 text-gray-500">{funding}</p>
    </div>
  );
}

function InterestMockup() {
  return (
    <div
      aria-hidden="true"
      className="rounded-card border-border shadow-medium border bg-white p-5"
    >
      <p className="text-caption font-semibold tracking-wide text-gray-400 uppercase">
        Investor interest
      </p>
      <div className="mt-3 flex items-center gap-3">
        <span className="bg-primary-50 text-primary-700 rounded-pill text-small flex size-10 shrink-0 items-center justify-center font-medium">
          A
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-small truncate font-semibold text-gray-900">
            Angel Investor
          </p>
          <p className="text-caption truncate text-gray-500">
            Interested in Voltra
          </p>
        </div>
        <span className="bg-gray-100 text-gray-700 rounded-pill text-caption flex items-center gap-1 px-2.5 py-0.5 font-medium">
          Pending
        </span>
      </div>
      <div className="mt-4 flex gap-2">
        <span className="border-border rounded-control text-small flex-1 border px-3 py-2 text-center font-semibold text-gray-700">
          Decline
        </span>
        <span className="bg-primary rounded-control text-small flex-1 px-3 py-2 text-center font-semibold text-white">
          Accept
        </span>
      </div>
    </div>
  );
}

function MessagingMockup() {
  return (
    <div
      aria-hidden="true"
      className="rounded-card border-border shadow-medium overflow-hidden border bg-white"
    >
      <div className="border-border flex items-center gap-2.5 border-b p-4">
        <span className="bg-primary-50 text-primary-700 rounded-pill text-caption flex size-8 shrink-0 items-center justify-center font-medium">
          A
        </span>
        <p className="text-small font-semibold text-gray-900">
          Angel Investor
        </p>
      </div>
      <div className="flex flex-col gap-2 p-4">
        <MessageBubble align="left">
          Hi — I&apos;d love to learn more about Voltra&apos;s traction so
          far.
        </MessageBubble>
        <MessageBubble align="right">
          Sure! We just crossed 4,000 active users, happy to share the
          full breakdown.
        </MessageBubble>
      </div>
    </div>
  );
}

function MessageBubble({
  align,
  children,
}: {
  align: "left" | "right";
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex",
        align === "right" ? "justify-end" : "justify-start",
      )}
    >
      <p
        className={cn(
          "rounded-card text-caption max-w-[85%] px-3 py-2",
          align === "right"
            ? "bg-primary text-white"
            : "bg-gray-100 text-gray-700",
        )}
      >
        {children}
      </p>
    </div>
  );
}

export { ProductShowcase };
