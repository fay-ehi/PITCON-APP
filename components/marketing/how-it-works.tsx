import {
  ArrowRight,
  Building2,
  Compass,
  Heart,
  MessageSquare,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/marketing/reveal";
import { IllustrationSlot } from "@/components/marketing/illustration-slot";

type JourneyStep = {
  icon: LucideIcon;
  title: string;
  body: string;
};

const FOUNDER_STEPS: JourneyStep[] = [
  {
    icon: Building2,
    title: "Create",
    body: "Build a startup profile — logo, pitch, industry, stage, and the funding you're seeking.",
  },
  {
    icon: Compass,
    title: "Get Discovered",
    body: "Publish it and it's immediately visible to investors browsing and searching Discover.",
  },
  {
    icon: MessageSquare,
    title: "Connect",
    body: "Accept an investor's interest and a private conversation opens between you.",
  },
];

const INVESTOR_STEPS: JourneyStep[] = [
  {
    icon: Compass,
    title: "Discover",
    body: "Browse published startups from the moment you sign in — search and filters are there when you want them.",
  },
  {
    icon: Heart,
    title: "Express Interest",
    body: "Preview a startup right inside Discover and let the founder know in one click.",
  },
  {
    icon: MessageSquare,
    title: "Connect",
    body: "Once the founder accepts, messaging opens up and the conversation can begin.",
  },
];

/**
 * The former "How PITCON works" section, retitled with a casual,
 * PITCON-specific phrase instead of a generic label.
 *
 * Layout: the Founder/Investor journey rows lead the section, followed
 * by the headline + illustration row (illustration on the left, text
 * on the right at lg).
 *
 * Journey rows render two ways depending on viewport:
 * - Mobile (<sm): a horizontally-scrollable, snap-to-card carousel.
 *   Cards are ~85% width so the next card peeks in at the edge as a
 *   swipe affordance.
 * - sm and up: unchanged — the original 3-column card grid with
 *   connecting arrows.
 */
function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-gray-100 py-16 sm:py-24">
      <Container width="wide">
        <div className="flex flex-col gap-16">
          <JourneyRow eyebrow="For Founders" steps={FOUNDER_STEPS} />
          <JourneyRow eyebrow="For Investors" steps={INVESTOR_STEPS} />
        </div>

        <div className="mt-16 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="order-1">
            <IllustrationSlot
              className="aspect-[4/3]"
              src="/images/how-it-works/pitch-connect.png"
              brief="A founder handing over a glowing pitch/lightbulb to an investor reaching for it — or two people meeting across a bridge/handshake. Warm, flat illustration style. PITCON purple as the lead color, with amber and coral as small accents."
            />
          </Reveal>

          <Reveal
            delayMs={100}
            className="order-2 text-center lg:text-left"
          >
            <h2 className="text-h1 text-gray-900">
              Pitch it. Get discovered. Connect.
            </h2>
            <p className="text-body-lg mt-4 text-gray-500">
              That&apos;s the whole loop — whichever side of it you&apos;re
              on.
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function JourneyRow({
  eyebrow,
  steps,
}: {
  eyebrow: string;
  steps: JourneyStep[];
}) {
  return (
    <Reveal>
      <p className="text-small text-primary text-center font-semibold sm:text-left">
        {eyebrow}
      </p>

      {/* Mobile: horizontal snap carousel, edge-to-edge with a peek */}
      <div
        className="
          -mx-4 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto
          px-4 pb-2 sm:hidden
          [-ms-overflow-style:none] [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {steps.map((step, index) => (
          <div key={step.title} className="w-[85%] shrink-0 snap-start">
            <StepCard step={step} index={index} />
          </div>
        ))}
      </div>

      {/* sm and up: original card grid with connecting arrows — unchanged */}
      <div className="relative mt-5 hidden gap-6 sm:grid sm:grid-cols-3 sm:gap-8">
        {steps.map((step, index) => (
          <div key={step.title} className="relative">
            <StepCard step={step} index={index} />
            {index < steps.length - 1 && (
              <ArrowRight
                aria-hidden
                className="text-primary-200 absolute top-9 -right-7 hidden size-5 sm:block"
              />
            )}
          </div>
        ))}
      </div>
    </Reveal>
  );
}

function StepCard({ step, index }: { step: JourneyStep; index: number }) {
  const Icon = step.icon;
  return (
    <div className="border-border rounded-card flex h-full flex-col items-start gap-3 border bg-white p-6">
      <div className="flex items-center gap-3">
        <span className="bg-primary-50 text-primary rounded-control flex size-10 shrink-0 items-center justify-center">
          <Icon className="size-5" aria-hidden />
        </span>
        <span className="text-caption font-semibold text-gray-300">
          0{index + 1}
        </span>
      </div>
      <p className="text-h3 text-gray-900">{step.title}</p>
      <p className="text-small text-gray-500">{step.body}</p>
    </div>
  );
}

export { HowItWorks };