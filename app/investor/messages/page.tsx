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
    // See app/founder/messages/page.tsx for why this is bounded to the
    // viewport (`h-[calc(100svh-4rem)]`, 4rem = the top bar's `h-16`)
    // instead of growing with content.
    <Container className="flex h-[calc(100svh-4rem)] flex-col py-10 sm:py-12">
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
  );
}
