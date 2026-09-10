import { ChevronDown } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/marketing/reveal";

/**
 * Sprint 11 brief section 7: "a small, useful FAQ section", answers
 * "only supported by the PITCON product/planning document and
 * implemented functionality" - nothing here states a claim that isn't
 * either directly implemented (verified by reading the actual
 * components) or explicitly documented. In particular: the PRD lists
 * "Premium subscriptions" under "9. Future Features (Out of Scope for
 * MVP)", which is what grounds the "is it free" answer below - there's
 * no invented pricing model, just what the PRD already says about this
 * stage of the product.
 */
const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "What is PITCON?",
    answer:
      "PITCON is a matchmaking platform for founders and investors. Founders create startup profiles, investors discover them in Discover, and the two connect once there's mutual interest.",
  },
  {
    question: "Who can join PITCON?",
    answer:
      "Anyone can join as a Founder or as an Investor. These are separate account types — a Founder account is not also an Investor account.",
  },
  {
    question: "Is PITCON free?",
    answer:
      "Yes. PITCON is free to join and use at this stage — there's no premium subscription or paid tier yet.",
  },
  {
    question: "How does matchmaking work?",
    answer:
      "Investors browse and search published startups in Discover. When one stands out, they express interest. The founder sees that interest and can accept or decline it.",
  },
  {
    question: "Can a Founder have multiple startups?",
    answer:
      "Yes — one Founder account can create and manage several independent startups, each with its own profile.",
  },
  {
    question: "When can Founders and Investors message each other?",
    answer:
      "Only after a Founder accepts an Investor's interest in a specific startup. Messaging opens automatically once that happens.",
  },
];

function FAQ() {
  return (
    <section id="faq" className="py-16 sm:py-24">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-h1 text-gray-900">Frequently asked questions</h2>
        </Reveal>

        <Reveal delayMs={100} className="mx-auto mt-10 max-w-2xl">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.question}
              className="group border-border marker:content-none border-b py-5 [&::-webkit-details-marker]:hidden"
            >
              <summary className="text-small flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-gray-900">
                {item.question}
                <ChevronDown
                  aria-hidden
                  className="size-4 shrink-0 text-gray-400 transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <p className="text-small mt-3 text-gray-500">{item.answer}</p>
            </details>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}

export { FAQ };
