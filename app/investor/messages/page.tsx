import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUserProfile } from "@/lib/auth/session";
import {
  getInvestorConversationDetail,
  getInvestorConversations,
  getMessagesPage,
} from "@/lib/queries/messages";
import { Container } from "@/components/shared/container";
import { MessagesWorkspace } from "@/components/messaging/messages-workspace";

export const metadata: Metadata = {
  title: "Messages",
};

/**
 * Messages destination for the Investor top bar's message icon
 * (components/investor/topbar.tsx) - Sprint 7's real implementation,
 * replacing the Sprint 5 placeholder shell. See
 * app/founder/messages/page.tsx for the shared reasoning (URL-driven
 * selection, a stale/unauthorized `conversation` id treated as
 * "nothing selected").
 */
export default async function InvestorMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ conversation?: string }>;
}) {
  const params = await searchParams;
  const current = await getCurrentUserProfile();
  if (!current) redirect("/login?next=/investor/messages");

  const conversations = await getInvestorConversations(current.userId);

  const requestedConversationId = params.conversation ?? null;
  const [activeConversation, messagesPage] = await Promise.all([
    requestedConversationId
      ? getInvestorConversationDetail(requestedConversationId, current.userId)
      : Promise.resolve(null),
    requestedConversationId
      ? getMessagesPage(requestedConversationId)
      : Promise.resolve({ messages: [], hasMore: false }),
  ]);

  return (
    // `fixed`, not `h-[calc(100svh-4rem)]` in normal flow (what this
    // used to be): `top-16`/`bottom-0` are resolved against the
    // viewport directly, so this box's height no longer depends on every
    // ancestor between it and <body> (main's flex-basis, body's
    // min-height, html's height) each computing correctly - see
    // components/messaging/messages-workspace.tsx's top comment for the
    // two rounds of internal flex/grid fixes that weren't enough on
    // their own, because the *page* itself, not just the pane inside it,
    // could end up taller than the viewport and force a document-level
    // scroll no internal `min-h-0` could reach. `top-16` matches
    // InvestorTopBar's own `h-16` (components/investor/topbar.tsx), the
    // only fixed chrome above this on the Investor side (no sidebar - see
    // app/founder/messages/page.tsx for the founder equivalent, which
    // also has to clear a sidebar).
    <div className="fixed inset-x-0 top-16 bottom-0 overflow-hidden bg-gray-50">
      <Container className="flex h-full flex-col py-6">
        <h1 className="text-h2 shrink-0 text-gray-900">Messages</h1>
        <p className="text-small mt-1 shrink-0 text-gray-500">
          Conversations with founders about startups you&apos;re interested in.
        </p>

        <MessagesWorkspace
          role="investor"
          basePath="/investor/messages"
          conversations={conversations}
          activeConversationId={
            activeConversation ? requestedConversationId : null
          }
          activeConversation={activeConversation}
          initialMessages={messagesPage.messages}
          hasMoreMessages={messagesPage.hasMore}
          currentUserId={current.userId}
        />
      </Container>
    </div>
  );
}
