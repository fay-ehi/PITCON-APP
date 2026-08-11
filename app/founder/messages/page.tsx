import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUserProfile } from "@/lib/auth/session";
import {
  getFounderConversationDetail,
  getFounderConversations,
  getMessagesPage,
} from "@/lib/queries/messages";
import { Container } from "@/components/shared/container";
import { MessagesWorkspace } from "@/components/messaging/messages-workspace";

export const metadata: Metadata = {
  title: "Messages",
};

/**
 * Messages workspace - Sprint 7's real implementation, replacing the
 * Sprint 4 placeholder shell. Selection (`?conversation=<id>`) lives in
 * the URL, same convention as Discover's `?startup=<id>` - refresh,
 * back/forward, and sharing a link to a specific conversation all fall
 * out of that for free.
 *
 * A `conversation` id that doesn't resolve (stale link, not one of this
 * founder's own startups' conversations) is treated as "nothing
 * selected" rather than an error - `getFounderConversationDetail`
 * already returns `null` for both "doesn't exist" and "not mine," and
 * this page doesn't need to tell those apart from a not-found id.
 */
export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ conversation?: string }>;
}) {
  const params = await searchParams;
  const current = await getCurrentUserProfile();
  if (!current) redirect("/login?next=/founder/messages");

  const conversations = await getFounderConversations(current.userId);

  const requestedConversationId = params.conversation ?? null;
  const [activeConversation, messagesPage] = await Promise.all([
    requestedConversationId
      ? getFounderConversationDetail(requestedConversationId, current.userId)
      : Promise.resolve(null),
    requestedConversationId
      ? getMessagesPage(requestedConversationId)
      : Promise.resolve({ messages: [], hasMore: false }),
  ]);

  return (
    <Container className="py-10 sm:py-12">
      <h1 className="text-h2 text-gray-900">Messages</h1>
      <p className="text-small mt-1 text-gray-500">
        Conversations with investors interested in your startups.
      </p>

      <MessagesWorkspace
        role="founder"
        basePath="/founder/messages"
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
