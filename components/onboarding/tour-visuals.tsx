import {
  ArrowRight,
  Building2,
  Check,
  Clock,
  Compass,
  Heart,
  Plus,
  Rocket,
  Search,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Every visual `ProductTour` (product-tour.tsx) can show for a step,
 * per the Sprint 10 brief's "VISUAL APPROACH": a mixture of real PITCON
 * UI miniatures (for My Startups, Discover, Startup Preview, Interest,
 * Messaging - concepts easier to understand visually) and restrained
 * SVG/illustration (for Welcome, transitions, and the final step).
 *
 * The miniatures below are built from the same design tokens as the
 * real components they represent (rounded-card/rounded-control,
 * border-border, primary-50/100/500, text-caption/small) rather than as
 * separate illustration assets, so they "resemble the actual PITCON UI"
 * as the brief requires instead of contradicting it. They're inert
 * (`aria-hidden` at the call site in tour-steps.tsx - each step's body
 * copy is the accessible description) and intentionally not
 * interactive: no real data, no real links, nothing here should be
 * mistaken for the live app underneath.
 *
 * Entrance motion is pure CSS (`animate-in` from tw-animate-css, same
 * mechanism as components/founder/my-startups-decoration.tsx) and
 * always paired with `motion-reduce:animate-none`, so a reduced-motion
 * preference drops it to a static frame rather than a faster version of
 * the same animation - no JS media-query hook required.
 */

const ORBIT_RING_OUTER = 88;
const ORBIT_RING_INNER = 60;

/** Shared frame for the four "illustration" steps (Welcome/Final for
 * each role) - concentric orbit rings + satellite dots (the same motif
 * as the My Startups decoration) with a solid brand-purple medallion
 * and a single centered lucide icon, so all four only differ by which
 * icon they carry rather than by an entirely separate piece of art. */
function TourMedallion({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="relative flex size-32 items-center justify-center sm:size-36">
      <svg
        viewBox="0 0 200 200"
        aria-hidden="true"
        focusable="false"
        className="absolute inset-0 size-full"
      >
        <circle
          cx="100"
          cy="100"
          r={ORBIT_RING_OUTER}
          fill="none"
          stroke="var(--color-primary-100)"
          strokeWidth="1.5"
        />
        <circle
          cx="100"
          cy="100"
          r={ORBIT_RING_INNER}
          fill="none"
          stroke="var(--color-primary-200)"
          strokeWidth="1.5"
        />
        <circle cx="169" cy="58" r="5" fill="var(--color-primary-300)" />
        <circle cx="36" cy="148" r="3.5" fill="var(--color-primary-200)" />
        <circle cx="166" cy="150" r="3" fill="var(--color-primary-200)" />
      </svg>
      <div className="shadow-medium bg-primary-500 rounded-pill relative flex size-16 items-center justify-center sm:size-[4.5rem]">
        <Icon className="size-7 text-white sm:size-8" aria-hidden />
      </div>
    </div>
  );
}

function FounderWelcomeIllustration() {
  return <TourMedallion icon={Rocket} />;
}

function FounderFinalIllustration() {
  return <TourMedallion icon={Sparkles} />;
}

function InvestorWelcomeIllustration() {
  return <TourMedallion icon={Compass} />;
}

function InvestorFinalIllustration() {
  return <TourMedallion icon={Sparkles} />;
}

/** Founder — "Your Startups": a miniature of the My Startups workspace,
 * deliberately showing three rows so the tour never implies a founder
 * is limited to one startup (per the brief's explicit warning). */
function FounderStartupsMini() {
  const startups = [
    { name: "Startup Alpha", stage: "Seed" },
    { name: "Startup Beta", stage: "Pre-seed" },
    { name: "Startup Gamma", stage: "Series A" },
  ];

  return (
    <div className="border-border shadow-subtle animate-in fade-in zoom-in-95 rounded-card w-full max-w-[280px] border bg-white p-3 duration-500 motion-reduce:animate-none sm:max-w-[300px]">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-caption font-semibold text-gray-900">
          My Startups
        </span>
        <span className="bg-primary-50 text-primary-600 rounded-pill flex size-5 items-center justify-center">
          <Plus className="size-3" aria-hidden />
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {startups.map((startup) => (
          <div
            key={startup.name}
            className="rounded-control flex items-center gap-2 bg-gray-50 px-2 py-1.5"
          >
            <span className="bg-primary-100 text-primary-600 rounded-control flex size-6 shrink-0 items-center justify-center">
              <Building2 className="size-3.5" aria-hidden />
            </span>
            <span className="text-caption min-w-0 flex-1 truncate font-medium text-gray-800">
              {startup.name}
            </span>
            <span className="text-caption shrink-0 text-gray-400">
              {startup.stage}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Founder — "Investor Discovery": your published startup on the left,
 * the Discover list on the right, with your card sliding softly into
 * that list - a small, one-time, subtle animation per the brief, not a
 * loop. */
function FounderDiscoveryMini() {
  return (
    <div className="flex w-full max-w-[300px] items-center gap-2">
      <div className="border-border shadow-subtle rounded-card flex shrink-0 flex-col items-center gap-1 border bg-white px-2.5 py-2.5">
        <span className="bg-primary-100 text-primary-600 rounded-control flex size-7 items-center justify-center">
          <Building2 className="size-4" aria-hidden />
        </span>
        <span className="text-caption font-medium text-gray-700">
          Your Startup
        </span>
      </div>

      <ArrowRight className="size-4 shrink-0 text-gray-300" aria-hidden />

      <div className="border-border shadow-subtle rounded-card min-w-0 flex-1 border bg-white p-2.5">
        <p className="text-caption mb-1.5 font-semibold text-gray-900">
          Discover
        </p>
        <div className="flex flex-col gap-1">
          <div className="border-primary bg-primary-50/60 animate-in fade-in slide-in-from-left-3 rounded-control flex items-center gap-1.5 border px-1.5 py-1 duration-700 motion-reduce:animate-none">
            <span className="bg-primary-500 rounded-pill size-1.5 shrink-0" />
            <span className="text-caption truncate font-medium text-gray-800">
              Your Startup
            </span>
          </div>
          <div className="rounded-control flex items-center gap-1.5 bg-gray-50 px-1.5 py-1">
            <span className="rounded-pill size-1.5 shrink-0 bg-gray-300" />
            <span className="text-caption truncate text-gray-400">
              Another Startup
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Founder — "Investor Interest": an investor's interest arriving
 * against your startup, in the same pending state the real Interests
 * list/badge uses. */
function FounderInterestMini() {
  return (
    <div className="border-border shadow-subtle animate-in fade-in zoom-in-95 rounded-card flex w-full max-w-[280px] items-center gap-2.5 border bg-white p-3 duration-500 motion-reduce:animate-none">
      <span className="bg-primary-50 text-primary-700 rounded-pill text-small flex size-9 shrink-0 items-center justify-center font-semibold">
        K
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-caption truncate font-medium text-gray-800">
          An investor
        </p>
        <p className="text-caption truncate text-gray-400">
          is interested in Startup Alpha
        </p>
      </div>
      <span className="rounded-pill text-caption inline-flex shrink-0 items-center gap-1 bg-gray-100 px-2 py-0.5 font-medium text-gray-700">
        <Clock className="size-3" aria-hidden />
        Pending
      </span>
    </div>
  );
}

/** Shared by both roles — "Connect & Message": interest turning into an
 * accepted state, then a short exchange of messages. `perspective`
 * only changes which side is rendered in the brand purple, matching
 * `message-bubble.tsx`'s "only the current user's bubbles are purple"
 * rule. */
function ConnectMessageMini({
  perspective,
}: {
  perspective: "founder" | "investor";
}) {
  const ownBubble =
    perspective === "founder"
      ? "Thanks for the interest — happy to share more."
      : "Excited to learn more about what you're building.";
  const otherBubble =
    perspective === "founder"
      ? "Loved your pitch — let's talk."
      : "Thanks for reaching out!";

  return (
    <div className="animate-in fade-in zoom-in-95 flex w-full max-w-[280px] flex-col items-center gap-2 duration-500 motion-reduce:animate-none">
      <span className="bg-primary-50 text-primary-700 rounded-pill text-caption inline-flex items-center gap-1 px-2.5 py-1 font-medium">
        <Check className="size-3" aria-hidden />
        Interest accepted
      </span>
      <div className="border-border shadow-subtle rounded-card flex w-full flex-col gap-1.5 border bg-white p-2.5">
        <div className="rounded-card text-caption max-w-[75%] bg-gray-100 px-2.5 py-1.5 text-gray-800">
          {otherBubble}
        </div>
        <div className="bg-primary rounded-card text-caption ml-auto max-w-[75%] px-2.5 py-1.5 text-white">
          {ownBubble}
        </div>
      </div>
    </div>
  );
}

/** Investor — "Discover Startups": startups already populated and
 * browsable the moment Discover opens - no search bar given visual
 * priority, per the brief's explicit "do not imply search first". */
function InvestorDiscoverMini() {
  const rows = ["Startup Alpha", "Startup Beta", "Startup Gamma"];

  return (
    <div className="border-border shadow-subtle animate-in fade-in zoom-in-95 rounded-card w-full max-w-[300px] border bg-white p-3 duration-500 motion-reduce:animate-none">
      <div className="rounded-control mb-2 flex items-center gap-1.5 bg-gray-50 px-2 py-1 text-gray-300">
        <Search className="size-3" aria-hidden />
        <span className="text-caption">Discover</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {rows.map((name, index) => (
          <div
            key={name}
            className="rounded-control border-border flex items-center gap-2 border bg-white px-2 py-1.5"
          >
            <span className="rounded-control flex size-6 shrink-0 items-center justify-center bg-gray-100 text-gray-300">
              <Building2 className="size-3.5" aria-hidden />
            </span>
            <span className="text-caption min-w-0 flex-1 truncate font-medium text-gray-800">
              {name}
            </span>
            {index === 0 && (
              <span className="text-caption shrink-0 text-gray-400">Seed</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Investor — "Preview Startups": selecting a result opens its preview
 * alongside the list, inside the same Discover surface - never a
 * separate page. */
function InvestorPreviewMini() {
  return (
    <div className="flex w-full max-w-[300px] items-center gap-2">
      <div className="border-primary bg-primary-50/60 shadow-subtle rounded-card flex shrink-0 flex-col items-center gap-1 border px-2.5 py-2.5">
        <span className="bg-primary-100 text-primary-600 rounded-control flex size-7 items-center justify-center">
          <Building2 className="size-4" aria-hidden />
        </span>
        <span className="text-caption font-medium text-gray-700">Selected</span>
      </div>

      <ArrowRight className="size-4 shrink-0 text-gray-300" aria-hidden />

      <div className="border-border shadow-subtle animate-in fade-in slide-in-from-right-3 rounded-card min-w-0 flex-1 border bg-white p-2.5 duration-700 motion-reduce:animate-none">
        <p className="text-caption truncate font-semibold text-gray-900">
          Startup Alpha
        </p>
        <p className="rounded-pill mt-1 h-1.5 w-4/5 bg-gray-100" />
        <p className="rounded-pill mt-1 h-1.5 w-3/5 bg-gray-100" />
        <span className="bg-primary rounded-control text-caption mt-2 inline-block px-2 py-1 font-medium text-white">
          Express Interest
        </span>
      </div>
    </div>
  );
}

/** Investor — "Express Interest": the same sent-state styling as the
 * real `ExpressInterestButton`, so the concept is instantly familiar
 * once the investor sees it live. */
function InvestorInterestMini() {
  return (
    <div className="border-primary-100 bg-primary-50 shadow-subtle animate-in fade-in zoom-in-95 rounded-card flex w-full max-w-[280px] items-center gap-2.5 border p-3 duration-500 motion-reduce:animate-none">
      <span className="bg-primary rounded-pill flex size-8 shrink-0 items-center justify-center text-white">
        <Heart className="size-4" aria-hidden fill="currentColor" />
      </span>
      <div className="min-w-0">
        <p className="text-primary-700 text-caption font-semibold">
          Interest sent
        </p>
        <p className="text-primary-700/80 text-caption">
          Startup Alpha will be notified.
        </p>
      </div>
    </div>
  );
}

export {
  FounderWelcomeIllustration,
  FounderFinalIllustration,
  FounderStartupsMini,
  FounderDiscoveryMini,
  FounderInterestMini,
  InvestorWelcomeIllustration,
  InvestorFinalIllustration,
  InvestorDiscoverMini,
  InvestorPreviewMini,
  InvestorInterestMini,
  ConnectMessageMini,
};
