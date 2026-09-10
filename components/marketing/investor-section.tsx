import Link from "next/link";
import { Compass, Eye, Heart, MessageSquare, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/marketing/reveal";

const INVESTOR_BENEFITS: { icon: LucideIcon; title: string; body: string }[] =
  [
    {
      icon: Compass,
      title: "Discover startups immediately",
      body: "Land straight in Discover — no empty dashboard to set up first.",
    },
    {
      icon: Search,
      title: "Explore startup information",
      body: "Search and filter by industry, stage, country, and funding.",
    },
    {
      icon: Eye,
      title: "Preview without losing context",
      body: "Open a startup's profile inline, right where you found it.",
    },
    {
      icon: Heart,
      title: "Express interest",
      body: "Let a founder know you're interested in one click.",
    },
    {
      icon: MessageSquare,
      title: "Connect after interest is accepted",
      body: "Once they accept, a direct conversation opens up.",
    },
  ];

/**
 * The dedicated Investor-focused section (Sprint 11 brief section 6) -
 * "Discover startups worth paying attention to." Deliberately the
 * mirror image of FounderSection's layout (panel first, copy second on
 * desktop) with a different visual treatment (outlined icon circles on
 * a bordered white card, on a gray section background) so the two
 * sections read as a matched pair rather than a repeated pattern.
 */
function InvestorSection() {
  return (
    <section id="for-investors" className="bg-gray-50 py-16 sm:py-24">
      <Container width="wide">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="rounded-marketing border-border order-2 border bg-white p-6 shadow-subtle sm:p-8 lg:order-1">
            <ul className="flex flex-col gap-6">
              {INVESTOR_BENEFITS.map((benefit) => (
                <li key={benefit.title} className="flex items-start gap-4">
                  <span className="border-primary text-primary rounded-control flex size-10 shrink-0 items-center justify-center border-2 bg-white">
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

          <Reveal delayMs={120} className="order-1 lg:order-2">
            <p className="text-small text-primary font-semibold">
              For Investors
            </p>
            <h2 className="text-h1 mt-3 text-gray-900">
              Discover startups worth paying attention to.
            </h2>
            <p className="text-body-lg mt-5 text-gray-500">
              Skip the cold inbound. Browse founder-built profiles, filter
              down to what fits your thesis, and reach out to the ones
              worth a conversation.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link href="/signup?role=investor">Start discovering</Link>
            </Button>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

export { InvestorSection };
