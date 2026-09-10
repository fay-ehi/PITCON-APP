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
 * "How PITCON works" (Sprint 11 brief section 3) - the Founder journey
 * (Create → Get Discovered → Connect) and Investor journey (Discover →
 * Express Interest → Connect) as compact icon/card rows rather than a
 * block of text, per the brief's "understandable within a few seconds."
 */
function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24">
      <Container width="wide">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-h1 text-gray-900">How PITCON works</h2>
          <p className="text-body-lg mt-4 text-gray-500">
            Two journeys, both built around the same core exchange: real
            startups, discoverable by the right investors.
          </p>
        </Reveal>

        <div className="mt-16 flex flex-col gap-16">
          <JourneyRow eyebrow="For Founders" steps={FOUNDER_STEPS} />
          <JourneyRow eyebrow="For Investors" steps={INVESTOR_STEPS} />
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
      <div className="relative mt-5 grid gap-6 sm:grid-cols-3 sm:gap-8">
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
    <div className="border-border rounded-card flex flex-col items-start gap-3 border bg-white p-6">
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
