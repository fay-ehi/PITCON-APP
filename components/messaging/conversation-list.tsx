import Link from "next/link";
import { Building2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatShortRelativeTime } from "@/lib/format/date";
import type { ConversationSummary } from "@/types/message";

/**
 * The conversation list pane - shared between Founder Messages and
 * Investor Messages, same "shared, differs only by which role's rows
 * land in it" reasoning as `components/notifications/notification-list.tsx`.
 * A plain server-rendered list of real `<Link>`s (`?conversation=<id>`,
 * same URL-driven-selection convention as Discover's `?startup=<id>`) -
 * switching conversations is a soft navigation, not client state, so
 * refresh/back/forward all keep working for free.
 *
 * Always shows the startup alongside the other participant - per the
 * brief's "CONVERSATION LIST" section ("Do not display only 'Jane Doe'
 * because the Investor may be communicating about multiple startups").
 * Unread state is never color-only: the dot carries an `aria-label`, and
 * unread rows also render in a heavier font weight, same two-channel
 * pattern as `NotificationList`.
 */
function ConversationList({
  conversations,
  basePath,
  activeConversationId,
  currentUserId,
}: {
  conversations: ConversationSummary[];
  basePath: "/founder/messages" | "/investor/messages";
  activeConversationId: string | null;
  currentUserId: string;
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

        return (
          <li key={conversation.id}>
            <Link
              href={`${basePath}?conversation=${conversation.id}`}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-start gap-3 p-4 text-left transition-colors hover:bg-gray-50",
                isActive && "bg-primary-50",
              )}
            >
              <div className="mt-2 flex size-2 shrink-0 items-center justify-center">
                {conversation.isUnread && (
                  <span
                    aria-label="Unread"
                    className="rounded-pill bg-primary size-2 shrink-0"
                  />
                )}
              </div>

              <div className="rounded-card border-border flex size-10 shrink-0 items-center justify-center overflow-hidden border bg-gray-100">
                {conversation.startup.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={conversation.startup.logoUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <Building2 className="size-4 text-gray-300" aria-hidden />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-small truncate text-gray-900",
                    conversation.isUnread ? "font-semibold" : "font-medium",
                  )}
                >
                  {conversation.startup.name || "Untitled startup"}
                </p>
                <p className="text-caption truncate text-gray-500">
                  {conversation.otherParticipant.fullName}
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
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export { ConversationList };
