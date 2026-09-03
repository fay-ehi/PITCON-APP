import {
  ConnectMessageMini,
  FounderDiscoveryMini,
  FounderFinalIllustration,
  FounderInterestMini,
  FounderStartupsMini,
  FounderWelcomeIllustration,
  InvestorDiscoverMini,
  InvestorFinalIllustration,
  InvestorInterestMini,
  InvestorPreviewMini,
  InvestorWelcomeIllustration,
} from "@/components/onboarding/tour-visuals";

/** One step of the product tour. `visual` is one of the illustrations
 * or UI miniatures from tour-visuals.tsx - `ProductTour` renders it
 * inside a uniform frame so every step shares the same composition
 * regardless of which kind of visual it is. */
export type TourStep = {
  id: string;
  heading: string;
  body: string;
  visual: React.ReactNode;
};

/**
 * The Founder sequence, per the Sprint 10 brief's "FOUNDER ONBOARDING"
 * section: Welcome, Your Startups (multi-startup, never "just one"),
 * Investor Discovery, Investor Interest, Connect & Message, then a
 * short final step. Six steps - not padded to a round number, not
 * trimmed below what the brief actually asks to be communicated; two of
 * the brief's concepts (Discovery and Interest) stay separate because
 * they're genuinely different moments in the founder's journey (being
 * seen vs. someone acting on it), not because of a step-count target.
 */
export const FOUNDER_TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    heading: "Welcome to PITCON",
    body: "PITCON helps you connect with investors who are actively looking for startups like yours.",
    visual: <FounderWelcomeIllustration />,
  },
  {
    id: "your-startups",
    heading: "Manage every startup you're building",
    body: "Create and manage as many startups as you need from one workspace — each has its own profile, pitch, and investor activity.",
    visual: <FounderStartupsMini />,
  },
  {
    id: "investor-discovery",
    heading: "Investors discover your startup",
    body: "Once published, your startup appears to investors browsing Discover — no extra step required on your part.",
    visual: <FounderDiscoveryMini />,
  },
  {
    id: "investor-interest",
    heading: "Investors express interest",
    body: "When an investor is interested in your startup, it lands here, waiting for you to accept or decline.",
    visual: <FounderInterestMini />,
  },
  {
    id: "connect-message",
    heading: "Accept, then start the conversation",
    body: "Accept an interest and a private conversation opens up — that's how founders and investors connect on PITCON.",
    visual: <ConnectMessageMini perspective="founder" />,
  },
  {
    id: "final",
    heading: "You're ready",
    body: "Head to My Startups to add your first startup, or explore the workspace at your own pace.",
    visual: <FounderFinalIllustration />,
  },
];

/**
 * The Investor sequence, per the brief's "INVESTOR ONBOARDING" section:
 * Welcome, Discover Startups (browsable immediately, search/filter is
 * optional), Preview Startups (within Discover, never a separate
 * page), Express Interest, Connect & Message, then a short final step.
 */
export const INVESTOR_TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    heading: "Welcome to PITCON",
    body: "PITCON helps you discover startups that are actively raising, and connect directly with the founders behind them.",
    visual: <InvestorWelcomeIllustration />,
  },
  {
    id: "discover-startups",
    heading: "Startups, ready to browse",
    body: "The moment you open Discover, startups are already there — browse right away, search and filter whenever you want.",
    visual: <InvestorDiscoverMini />,
  },
  {
    id: "preview-startups",
    heading: "Preview without leaving Discover",
    body: "Select any startup and its full preview opens right here — no separate page to navigate to and back from.",
    visual: <InvestorPreviewMini />,
  },
  {
    id: "express-interest",
    heading: "Express interest when something clicks",
    body: "Found a startup worth a closer look? A single click lets the founder know you're interested.",
    visual: <InvestorInterestMini />,
  },
  {
    id: "connect-message",
    heading: "Message once a founder accepts",
    body: "If the founder accepts your interest, a private conversation opens between you — that's when messaging becomes available.",
    visual: <ConnectMessageMini perspective="investor" />,
  },
  {
    id: "final",
    heading: "You're ready to discover",
    body: "Startups are waiting. Jump into Discover and start browsing.",
    visual: <InvestorFinalIllustration />,
  },
];
