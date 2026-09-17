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
    // `fixed`, not `h-[calc(100svh-4rem)]` in normal flow - see
    // app/investor/messages/page.tsx for the full reasoning (this page
    // used to have the same comment that page had).
    //
    // `left-0 lg:left-60`, not `left-16 lg:left-60`: FounderSidebar
    // (components/founder/sidebar.tsx) used to be a permanently-visible
    // rail at every width (`w-16` below `lg`, `w-60` at `lg`+), which is
    // what the `left-16` here used to clear. It's since become an
    // off-canvas drawer below `lg` (`fixed -translate-x-full`, opened via
    // FounderTopBar's hamburger) - closed by default, it reserves no
    // space in flow at all, so this page should start flush at the left
    // edge there instead of leaving a gap the width of a rail that no
    // longer exists. At `lg`+ the sidebar is still `sticky` and still
    // `w-60`, so `lg:left-60` is unchanged. `top-16` matches
    // FounderTopBar's own `h-16` (components/founder/topbar.tsx).
    <div className="fixed top-16 right-0 bottom-0 left-0 overflow-hidden bg-gray-50 lg:left-60">
      <Container className="flex h-full flex-col py-6">
        <h1 className="text-h2 shrink-0 text-gray-900">Messages</h1>
        <p className="text-small mt-1 shrink-0 text-gray-500">
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
    </div>
  );
}
