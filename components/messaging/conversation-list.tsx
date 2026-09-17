"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { formatShortRelativeTime } from "@/lib/format/date";
import type { ConversationSummary } from "@/types/message";

/**
 * The conversation list pane - shared between Founder Messages and
 * Investor Messages, same "shared, differs only by which role's rows
 * land in it" reasoning as `components/notifications/notification-list.tsx`.
 * Each row is a real `<Link>` (`?conversation=<id>`, same URL-driven-
 * selection convention as Discover's `?startup=<id>`) - switching
 * conversations is a soft navigation, not client state, so refresh/
 * back/forward all keep working for free.
 *
 * `onSelect` rides on top of that Link, same click-guard pattern as
 * `startup-result-card.tsx` (only takes over an ordinary left-click;
 * modifier/middle clicks still open in a new tab natively) - it's what
 * lets `MessagesWorkspace` mark this row selected and show the thread
 * pane's loading skeleton the instant it's clicked, rather than the
 * row doing nothing visible until the navigation resolves. See that
 * component's top comment for why this needed adding (it didn't exist
 * until now - unlike most of this app's other navigation, selecting a
 * conversation lands on real server data that has to be fetched, not
 * an already-rendered destination).
 *
 * Always shows the startup alongside the other participant - per the
 * brief's "CONVERSATION LIST" section ("Do not display only 'Jane Doe'
 * because the Investor may be communicating about multiple startups").
 * Unread state is never color-only: the dot carries an `aria-label`, and
 * unread rows also render in a heavier font weight, same two-channel
 * pattern as `NotificationList`.
 *
 * Who's the headline differs by role: a Founder is scanning for *which
 * investor* is messaging them, so the investor's own avatar/name lead
 * (same identify-the-person pattern as `InterestRow`). An Investor
 * already knows who they are; they're scanning for *which startup* a
 * thread is about, so the startup's logo/name lead instead. Each row
 * only carries the one identity relevant to that scan, plus the last
 * message preview - not both, to keep the row scannable.
 */
function ConversationList({
  conversations,
  basePath,
  role,
  activeConversationId,
  currentUserId,
  onSelect,
}: {
  conversations: ConversationSummary[];
  basePath: "/founder/messages" | "/investor/messages";
  role: "founder" | "investor";
  /** The optimistically-selected id, from `MessagesWorkspace` - see that
   * component's top comment. Highlighting follows this, not the
   * server-confirmed selection, so a row lights up the instant it's
   * clicked. */
  activeConversationId: string | null;
  currentUserId: string;
  onSelect: (conversationId: string, href: string) => void;
}) {
  return (
    <ul
      aria-label="Conversations"
      className="divide-border flex flex-1 flex-col divide-y overflow-y-auto"
    >
      {conversations.map((conversation) => {
        const isActive = conversation.id === activeConversationId;
        const isOwnLastMessage =
          conversation.lastMessageSenderId === currentUserId;
        const initial =
          conversation.otherParticipant.fullName.trim().slice(0, 1).toUpperCase() ||
          "?";
        const href = `${basePath}?conversation=${conversation.id}`;

        function handleClick(event: MouseEvent<HTMLAnchorElement>) {
          // Modifier/middle clicks mean "open in a new tab" - let the
          // browser handle those natively rather than hijacking them
          // for the optimistic selection.
          if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          ) {
            return;
          }
          event.preventDefault();
          onSelect(conversation.id, href);
        }

        const rowContent = (
          <>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-small flex items-center gap-1 text-gray-900",
                  conversation.isUnread ? "font-semibold" : "font-medium",
                )}
              >
                <span className="truncate">
                  {role === "founder"
                    ? conversation.otherParticipant.fullName
                    : conversation.startup.name || "Untitled startup"}
                </span>
                <VerifiedBadge verified={conversation.otherParticipant.verified} />
              </p>
              {conversation.lastMessagePreview && (
                <p
                  className={cn(
                    "text-caption mt-0.5 truncate",
                    conversation.isUnread
                      ? "font-medium text-gray-700"
                      : "text-gray-400",
                  )}
                >
                  {isOwnLastMessage && "You: "}
                  {conversation.lastMessagePreview}
                </p>
              )}
            </div>

            {conversation.lastMessageAt && (
              <span className="text-caption shrink-0 text-gray-400">
                {formatShortRelativeTime(conversation.lastMessageAt)}
              </span>
            )}
          </>
        );

        const unreadDot = (
          <div className="mt-2 flex size-2 shrink-0 items-center justify-center">
            {conversation.isUnread && (
              <span
                aria-label="Unread"
                className="rounded-pill bg-primary size-2 shrink-0"
              />
            )}
          </div>
        );

        return (
          <li key={conversation.id}>
            {role === "founder" ? (
              // The Investor's avatar is its own link to their public
              // profile (`/founder/investors/[investorId]`), separate
              // from the rest of the row (which opens the
              // conversation) - two nested `<a>`s aren't valid HTML, so
              // this can't just be one link wrapping everything the
              // way the Investor-role row below still is. `onSelect`
              // only ever applies to the conversation Link, never the
              // avatar's profile link.
              <div
                className={cn(
                  "flex items-start gap-3 p-4 transition-colors hover:bg-gray-50",
                  isActive && "bg-primary-50",
                )}
              >
                {unreadDot}

                <Link
                  href={`/founder/investors/${conversation.otherParticipant.id}`}
                  aria-label={`View ${conversation.otherParticipant.fullName}'s profile`}
                  className="rounded-pill shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage
                      src={conversation.otherParticipant.avatarUrl ?? undefined}
                      alt=""
                    />
                    <AvatarFallback>{initial}</AvatarFallback>
                  </Avatar>
                </Link>

                <Link
                  href={href}
                  onClick={handleClick}
                  aria-current={isActive ? "page" : undefined}
                  className="flex min-w-0 flex-1 items-start gap-3 text-left outline-none"
                >
                  {rowContent}
                </Link>
              </div>
            ) : (
              <Link
                href={href}
                onClick={handleClick}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-start gap-3 p-4 text-left transition-colors hover:bg-gray-50",
                  isActive && "bg-primary-50",
                )}
              >
                {unreadDot}

                <div className="rounded-card bg-primary-50 flex size-10 shrink-0 items-center justify-center overflow-hidden">
                  {conversation.startup.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={conversation.startup.logoUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <Building2 className="text-primary size-4" aria-hidden />
                  )}
                </div>

                {rowContent}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export { ConversationList };
