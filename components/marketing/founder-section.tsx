import Link from "next/link";
import {
  Building2,
  Compass,
  Heart,
  Layers,
  MessageSquare,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/marketing/reveal";

const FOUNDER_BENEFITS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Building2,
    title: "Create and manage startups",
    body: "One founder account, as many startups as you're building.",
  },
  {
    icon: Layers,
    title: "Present the startup clearly",
    body: "A single, structured profile — no scattered decks or one-off emails.",
  },
  {
    icon: Compass,
    title: "Get discovered by investors",
    body: "Every published startup is visible the moment an investor opens Discover.",
  },
  {
    icon: Heart,
    title: "Receive investor interest",
    body: "See exactly who's interested, and decide whether to accept.",
  },
  {
    icon: MessageSquare,
    title: "Connect when there's mutual interest",
    body: "Accepting opens a direct conversation with that investor.",
  },
];

/**
 * The dedicated Founder-focused section (Sprint 11 brief section 5) -
 * "Put your startup in front of the right investors." A two-column
 * layout (copy + CTA beside a benefit list on a soft primary tint
 * panel) rather than the brief's explicitly-ruled-out "standard
 * three-column SaaS feature grid".
 */
function FounderSection() {
  return (
    <section id="for-founders" className="py-16 sm:py-24">
      <Container width="wide">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="text-small text-primary font-semibold">
              For Founders
            </p>
            <h2 className="text-h1 mt-3 text-gray-900">
              Put your startup in front of the right investors.
            </h2>
            <p className="text-body-lg mt-5 text-gray-500">
              Build one clear profile for each startup you&apos;re running, and
              let interested investors come to you instead of chasing cold
              intros.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link href="/signup?role=founder">
                Create your startup profile
              </Link>
            </Button>
          </Reveal>

          <Reveal delayMs={120} className="bg-primary-50/60 rounded-marketing p-6 sm:p-8">
            <ul className="flex flex-col gap-6">
              {FOUNDER_BENEFITS.map((benefit) => (
                <li key={benefit.title} className="flex items-start gap-4">
                  <span className="rounded-control bg-primary text-white flex size-10 shrink-0 items-center justify-center">
                    <benefit.icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-small font-semibold text-gray-900">
                      {benefit.title}
                    </p>
                    <p className="text-caption mt-0.5 text-gray-500">
                      {benefit.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

export { FounderSection };
