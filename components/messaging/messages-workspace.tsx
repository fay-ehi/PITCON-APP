"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";

import { cn } from "@/lib/utils";
import { ConversationList } from "@/components/messaging/conversation-list";
import { ConversationThread } from "@/components/messaging/conversation-thread";
import { NoConversationsState } from "@/components/messaging/no-conversations-state";
import { Skeleton } from "@/components/ui/skeleton";
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
 * "DESKTOP DESIGN"/"MOBILE DESIGN": one layout handles both. Desktop
 * (`md:` and up) always shows both panes side by side. Below `md`, only
 * one pane is visible at a time - the list pane hides once a conversation
 * is selected, the thread pane hides until one is.
 *
 * SELECTION IS OPTIMISTIC, same `useOptimistic` + `startTransition`
 * pattern as `discover-workspace.tsx` (see that file's top comment for
 * the full reasoning) - added because, unlike opening most things in
 * this app, selecting a conversation here means fetching a whole
 * message history from the server, and with no visible feedback while
 * that's in flight it looked like clicking a conversation had done
 * nothing, which was enough to make it feel natural to click it again
 * (or a different one) before the first click had even landed.
 * `activeConversationId`/`activeConversation` below are the
 * server-confirmed selection (from the `?conversation=` search param
 * the page read, same convention as Discover's `?startup=`);
 * `optimisticConversationId` is what actually drives the UI:
 *
 * - `ConversationList` highlights off the optimistic id, so a row lights
 *   up the instant it's clicked (`ConversationList`'s own `onSelect`).
 * - Which pane shows on mobile (`hasSelection` below) also follows the
 *   optimistic id - so tapping "back" out of a conversation
 *   (`ConversationThread`'s `onBack`) flips straight back to the list
 *   instantly, rather than sitting on the now-stale thread until the
 *   navigation resolves.
 * - The thread pane itself shows a loading skeleton
 *   (`ConversationThreadSkeleton`) for exactly the window where the
 *   optimistic id disagrees with the confirmed one - i.e. we know
 *   *which* conversation should show, but its real messages haven't
 *   arrived yet - rather than either a blank pane or the previous
 *   conversation's content.
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
  /** Server-confirmed selection, from the `?conversation=` search param. */
  activeConversationId: string | null;
  /** Server-confirmed conversation data for `activeConversationId` -
   * `null` while unselected, or if the id doesn't resolve to one of
   * this user's own conversations. */
  activeConversation: ConversationDetail | null;
  initialMessages: MessageSummary[];
  hasMoreMessages: boolean;
  currentUserId: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [optimisticId, setOptimisticId] = useOptimistic<string | null, string | null>(
    activeConversationId,
    (_current, next) => next,
  );

  if (conversations.length === 0) {
    return <NoConversationsState role={role} />;
  }

  function selectConversation(conversationId: string, href: string) {
    startTransition(() => {
      setOptimisticId(conversationId);
      router.push(href, { scroll: false });
    });
  }

  function closeConversation() {
    startTransition(() => {
      setOptimisticId(null);
      router.push(basePath, { scroll: false });
    });
  }

  const isConfirmed = optimisticId === activeConversationId;
  // The optimistic id disagreeing with the confirmed one means we're
  // still waiting on the navigation that fetches this conversation's
  // real messages - show a skeleton for that window rather than
  // nothing, or the previous conversation's content.
  const threadLoading = Boolean(optimisticId) && !isConfirmed;
  // Only trust `activeConversation` once the id it's for has actually
  // been confirmed - otherwise, right after selecting a new
  // conversation (or clicking "back"), this would still be the
  // *previous* selection's data for one render, since the server
  // hasn't caught up to `optimisticId` yet.
  const threadConversation = isConfirmed ? activeConversation : null;
  // Deliberately not just `Boolean(optimisticId)`: a `?conversation=`
  // id that doesn't resolve to one of this user's own conversations
  // (stale link, someone else's) would otherwise look identical to a
  // conversation that's still loading, and on mobile that would hide
  // *both* panes (thread has nothing to show, but the list pane
  // still thinks something's selected) rather than falling back to
  // the list, like `NoConversationsState`'s sibling states do.
  const hasSelection = Boolean(optimisticId) && (threadLoading || Boolean(threadConversation));

  // Only the Investor gets a "View startup" link here - a Founder is
  // already the owner of the startup being discussed, so sending them to
  // a read-only view of their own listing from inside a chat with the
  // investor adds a link with nothing new to show. An investor's "View
  // startup" points at Discover's preview, which only resolves published
  // startups - see the brief's "if appropriate" for this control; a
  // since-unpublished startup simply means the link isn't offered, not a
  // broken one.
  const startupProfileHref =
    threadConversation && role === "investor"
      ? `/investor/discover?startup=${threadConversation.startup.id}`
      : null;

  // `flex-1 min-h-0`, not a fixed height: the page (see
  // app/founder/messages/page.tsx and app/investor/messages/page.tsx)
  // pins itself directly to the viewport with `position: fixed` and
  // hands this component whatever's left after the heading, via a
  // `flex flex-col` ancestor with a genuinely definite height. `min-h-0`
  // is required alongside `flex-1` because a flex item's default
  // `min-height: auto` would otherwise let this component's content (a
  // whole conversation's worth of messages) demand more height than the
  // flex parent actually has, defeating the point - same reasoning
  // extends to every pane below.
  //
  // Deliberately no `min-h-[…]` floor on the box below (there used to be
  // one, `min-h-[26rem]`, meant to keep this usable on very short
  // viewports) - once the parent chain above has a genuinely fixed,
  // viewport-derived height, an explicit minimum on this box can only
  // ever cause harm: `flex-1` already gives it 100% of whatever's left
  // after the heading, which is never negative, so nothing here can
  // overflow the parent on its own. A `min-h` floor breaks exactly that
  // guarantee the moment the heading is taller than expected, or the
  // viewport shorter than the floor - both of which were, at one point
  // each, the actual reason the composer went missing entirely instead
  // of merely needing a scroll.
  //
  // Flexbox, not CSS Grid, for the two panes below: a `grid
  // grid-cols-1 md:grid-cols-[300px_1fr]` (what this used to be) sizes
  // its single implicit row from each item's own natural, unclipped
  // content height - a whole message history - before `min-h-0` on the
  // item gets a say. A flex row's cross-axis `stretch` (the default)
  // works the other way: each pane is sized to match *this* container's
  // already-known height first, and only then does `min-h-0` on the pane
  // stop its own content from re-expanding past that.
  return (
    <div className="rounded-card border-border mt-4 flex flex-1 flex-col overflow-hidden border bg-white md:flex-row">
      <div
        className={cn(
          "border-border flex min-h-0 flex-col md:w-[300px] md:shrink-0 md:border-r",
          hasSelection && "hidden md:flex",
        )}
      >
        <ConversationList
          conversations={conversations}
          basePath={basePath}
          role={role}
          activeConversationId={optimisticId}
          currentUserId={currentUserId}
          onSelect={selectConversation}
        />
      </div>

      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col",
          !hasSelection && "hidden md:flex",
        )}
      >
        {threadLoading ? (
          <ConversationThreadSkeleton />
        ) : threadConversation ? (
          <ConversationThread
            key={threadConversation.id}
            basePath={basePath}
            role={role}
            conversation={threadConversation}
            initialMessages={initialMessages}
            hasMoreMessages={hasMoreMessages}
            currentUserId={currentUserId}
            startupProfileHref={startupProfileHref}
            onBack={closeConversation}
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

/** Mirrors `ConversationThread`'s shape (header, message history,
 * composer) so the swap from skeleton to real content doesn't visibly
 * jump around once data arrives - same "outline the real layout, don't
 * just spin" convention as Discover's `PreviewSkeleton`. Message bubbles
 * alternate sides to read as a conversation rather than a generic list. */
function ConversationThreadSkeleton() {
  return (
    <div className="flex flex-1 flex-col">
      <span className="sr-only" role="status">
        Loading conversation&hellip;
      </span>

      <div className="border-border flex items-center gap-3 border-b p-4" aria-hidden>
        <Skeleton className="size-9 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-end gap-2 p-4" aria-hidden>
        <Skeleton className="h-10 w-2/3 rounded-2xl" />
        <Skeleton className="ml-auto h-10 w-1/2 rounded-2xl" />
        <Skeleton className="h-14 w-3/4 rounded-2xl" />
      </div>

      <div className="border-border border-t p-4" aria-hidden>
        <Skeleton className="h-10 w-full rounded-full" />
      </div>
    </div>
  );
}

export { MessagesWorkspace };
