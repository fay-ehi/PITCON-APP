import type { Metadata } from "next";
import { MessageSquare, Search } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "Messages",
};

/**
 * Messages workspace - replaces the main workspace entirely when
 * selected in the sidebar (per the brief's navigation principle: this
 * is the full Messages interface, not a widget living alongside My
 * Startups).
 *
 * There is no messaging backend yet - no `conversations`/`messages`
 * tables, no realtime wiring - that's out of scope for Sprint 4, which
 * is the workspace/shell itself. Per the brief ("establish the
 * appropriate UI/data boundaries without inventing fake conversations"
 * / "do NOT populate the interface with fake production data"), this
 * renders the real two-pane layout the eventual feature will use, in
 * its "no conversations yet" state, rather than mocking up sample
 * threads. Wiring a real conversation list into the left pane and a
 * real thread into the right pane is future-sprint work.
 */
export default function MessagesPage() {
  return (
    <Container className="py-10 sm:py-12">
      <h1 className="text-h2 text-gray-900">Messages</h1>
      <p className="text-small mt-1 text-gray-500">
        Conversations with investors interested in your startups.
      </p>

      <div className="rounded-card border-border mt-8 grid grid-cols-1 overflow-hidden border bg-white md:h-[32rem] md:grid-cols-[280px_1fr]">
        <div className="border-border flex flex-col md:border-r">
          <div className="border-border border-b p-3">
            <div className="relative">
              <Search
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400"
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
          <div className="rounded-pill bg-primary-50 flex size-14 items-center justify-center">
            <MessageSquare className="text-primary size-6" aria-hidden />
          </div>
          <div>
            <p className="text-small font-medium text-gray-900">
              No conversations yet
            </p>
            <p className="text-caption mt-1 max-w-xs text-gray-500">
              When an investor messages you about one of your startups,
              you&apos;ll see the conversation here.
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
}
