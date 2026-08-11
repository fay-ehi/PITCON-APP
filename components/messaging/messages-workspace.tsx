import { MessageSquare } from "lucide-react";

import { cn } from "@/lib/utils";
import { ConversationList } from "@/components/messaging/conversation-list";
import { ConversationThread } from "@/components/messaging/conversation-thread";
import { NoConversationsState } from "@/components/messaging/no-conversations-state";
import type {
  ConversationDetail,
  ConversationSummary,
  MessageSummary,
} from "@/types/message";

/**
 * The real two-pane Messages experience (list | active conversation) for
 * both roles - shared for the same reason `components/notifications/`
 * is shared: same tables, same layout, differs only in which role's rows
 * land in it and where a couple of role-specific links point.
 *
 * "DESKTOP DESIGN"/"MOBILE DESIGN": one grid handles both. Desktop
 * (`md:` and up) always shows both panes side by side. Below `md`, only
 * one pane is visible at a time - the list pane hides once a conversation
 * is selected, the thread pane hides until one is - driven entirely by
 * whether `activeConversationId` is set (itself just the `?conversation=`
 * search param the page read), no client JS/state needed for the
 * responsive toggle itself. `ConversationThread`'s own header supplies
 * the mobile "back to conversations" link back out of the thread pane.
 */
function MessagesWorkspace({
  role,
  basePath,
  conversations,
  activeConversationId,
  activeConversation,
  initialMessages,
  hasMoreMessages,
  currentUserId,
}: {
  role: "founder" | "investor";
  basePath: "/founder/messages" | "/investor/messages";
  conversations: ConversationSummary[];
  activeConversationId: string | null;
  activeConversation: ConversationDetail | null;
  initialMessages: MessageSummary[];
  hasMoreMessages: boolean;
  currentUserId: string;
}) {
  if (conversations.length === 0) {
    return <NoConversationsState role={role} />;
  }

  const hasSelection = Boolean(activeConversationId && activeConversation);

  // Only the Investor gets a "View startup" link here - a Founder is
  // already the owner of the startup being discussed, so sending them to
  // a read-only view of their own listing from inside a chat with the
  // investor adds a link with nothing new to show. An investor's "View
  // startup" points at Discover's preview, which only resolves published
  // startups - see the brief's "if appropriate" for this control; a
  // since-unpublished startup simply means the link isn't offered, not a
  // broken one.
  const startupProfileHref =
    activeConversation && role === "investor"
      ? `/investor/discover?startup=${activeConversation.startup.id}`
      : null;

  // `flex-1 min-h-0`, not a fixed height: the page (see
  // app/founder/messages/page.tsx and app/investor/messages/page.tsx)
  // already bounds itself to the viewport and hands this component
  // whatever's left after the heading, via a `flex flex-col` ancestor.
  // A fixed height here (what this used to be) only bounds the pane's
  // *own* scrolling - it does nothing to stop the page around it from
  // growing taller than the viewport and pushing the whole pane, composer
  // included, below the fold. `min-h-0` is required alongside `flex-1`
  // because a flex item's default `min-height: auto` would otherwise let
  // its content (a whole conversation's worth of messages) demand more
  // height than the flex parent actually has, defeating the point.
  // `min-h-[26rem]` keeps this usable on very short viewports instead of
  // collapsing toward zero.
  return (
    <div className="rounded-card border-border mt-8 grid min-h-[26rem] flex-1 grid-cols-1 overflow-hidden border bg-white md:grid-cols-[300px_1fr]">
      <div
        className={cn(
          "border-border flex flex-col md:border-r",
          hasSelection && "hidden md:flex",
        )}
      >
        <ConversationList
          conversations={conversations}
          basePath={basePath}
          role={role}
          activeConversationId={activeConversationId}
          currentUserId={currentUserId}
        />
      </div>

      <div
        className={cn(
          "flex min-w-0 flex-col",
          !hasSelection && "hidden md:flex",
        )}
      >
        {hasSelection && activeConversation ? (
          <ConversationThread
            key={activeConversation.id}
            basePath={basePath}
            role={role}
            conversation={activeConversation}
            initialMessages={initialMessages}
            hasMoreMessages={hasMoreMessages}
            currentUserId={currentUserId}
            startupProfileHref={startupProfileHref}
          />
        ) : (
          <div className="hidden flex-col items-center justify-center gap-3 p-6 text-center md:flex">
            <div className="rounded-pill bg-primary-50 flex size-14 items-center justify-center">
              <MessageSquare className="text-primary size-6" aria-hidden />
            </div>
            <div>
              <p className="text-small font-medium text-gray-900">
                Select a conversation
              </p>
              <p className="text-caption mt-1 max-w-xs text-gray-500">
                Choose a conversation from the list to view messages.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { MessagesWorkspace };
