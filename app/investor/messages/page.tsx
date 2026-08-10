import type { Metadata } from "next";
import { MessageSquare, Search } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "Messages",
};

/**
 * Messages destination for the Investor top bar's message icon
 * (components/investor/topbar.tsx) - see the Sprint 5 brief's "MESSAGES
 * INDICATOR" ("If it does not exist, implement the navigation/UI
 * boundary cleanly without fake conversations").
 *
 * There is no messaging backend yet - no `conversations`/`messages`
 * tables, no realtime wiring, and no Express Interest action yet either
 * (explicitly excluded from this sprint), so there's nothing genuine to
 * message founders about. Mirrors app/founder/messages/page.tsx's real
 * two-pane layout in its "no conversations yet" state rather than
 * mocking up sample threads; wiring an actual conversation list and
 * thread view is future-sprint work, once messaging exists.
 */
export default function InvestorMessagesPage() {
  return (
    <Container className="py-10 sm:py-12">
      <h1 className="text-h2 text-gray-900">Messages</h1>
      <p className="mt-1 text-small text-gray-500">
        Conversations with founders about startups you&apos;re interested in.
      </p>

      <div className="mt-8 grid grid-cols-1 overflow-hidden rounded-card border border-border bg-white md:h-[32rem] md:grid-cols-[280px_1fr]">
        <div className="flex flex-col border-border md:border-r">
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400"
                aria-hidden
              />
              <Input
                type="search"
                placeholder="Search conversations"
                className="pl-9"
                disabled
              />
            </div>
          </div>
          <div className="flex flex-1 items-center justify-center p-6 text-center">
            <p className="text-caption text-gray-400">No conversations yet.</p>
          </div>
        </div>

        <div className="hidden flex-col items-center justify-center gap-3 p-6 text-center md:flex">
          <div className="flex size-14 items-center justify-center rounded-pill bg-primary-50">
            <MessageSquare className="size-6 text-primary" aria-hidden />
          </div>
          <div>
            <p className="text-small font-medium text-gray-900">No conversations yet</p>
            <p className="mt-1 max-w-xs text-caption text-gray-500">
              When you message a founder about one of their startups,
              you&apos;ll see the conversation here.
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
}
