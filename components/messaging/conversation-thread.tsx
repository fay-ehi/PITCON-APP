"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { ArrowLeft, Building2, ExternalLink } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import {
  loadEarlierMessagesAction,
  markConversationReadAction,
  sendMessageAction,
} from "@/lib/messages/message-actions";
import {
  MessageBubble,
  type ThreadMessage,
} from "@/components/messaging/message-bubble";
import { MessageComposer } from "@/components/messaging/message-composer";
import type { ConversationDetail, MessageSummary } from "@/types/message";

/**
 * The active conversation - header, the scrollable message history, and
 * the composer. Rendered with `key={conversation.id}` by
 * `MessagesWorkspace` so selecting a different conversation remounts
 * this component fresh (new realtime subscription, new local message
 * state, scrolled to the bottom) instead of trying to reconcile props
 * changing out from under existing state.
 *
 * REAL-TIME (brief's "REAL-TIME UPDATES"): subscribes to Supabase
 * Realtime `postgres_changes` INSERTs on `messages`, filtered to this
 * conversation. Deliberately ignores events where `sender_id ===
 * currentUserId` - our own sends are already reconciled via
 * `sendMessageAction`'s own response (see `handleSend`), in the same
 * request/response cycle, with no race to resolve. Realtime here is
 * purely for "the *other* participant's message shows up without a
 * refresh," which keeps the reconciliation logic to one path per
 * direction instead of needing to de-duplicate an optimistic send
 * against an incoming realtime echo of that same send.
 *
 * SENDING: optimistic - a temporary bubble (`pending: true`, a
 * client-generated id) appears immediately; `sendMessageAction`'s
 * response either replaces it in place with the confirmed row (real id +
 * timestamp) or, on failure, marks it `failed` with a "Retry" affordance
 * that resends the same content against the same temporary id (brief's
 * "Handle failed sends gracefully" / "Retry" test case).
 */
function ConversationThread({
  basePath,
  conversation,
  initialMessages,
  hasMoreMessages,
  currentUserId,
  startupProfileHref,
}: {
  basePath: "/founder/messages" | "/investor/messages";
  conversation: ConversationDetail;
  initialMessages: MessageSummary[];
  hasMoreMessages: boolean;
  currentUserId: string;
  /** Where "View startup" should link to, or `null` when there's nowhere
   * appropriate to send the viewer (see the brief's "if appropriate" for
   * this control) - resolved by `MessagesWorkspace`. */
  startupProfileHref: string | null;
}) {
  const [messages, setMessages] = useState<ThreadMessage[]>(initialMessages);
  const [hasMore, setHasMore] = useState(hasMoreMessages);
  const [isLoadingEarlier, startLoadEarlierTransition] = useTransition();
  const [isSending, startSendTransition] = useTransition();

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastActionRef = useRef<"init" | "append" | "prepend">("init");
  const prevScrollHeightRef = useRef(0);

  // Mark read on open - covers arriving at a conversation that already
  // has unread messages waiting.
  useEffect(() => {
    void markConversationReadAction(conversation.id);
  }, [conversation.id]);

  // Keep the scroll position sane across every kind of message-list
  // change: jump to the bottom on mount and whenever a message is
  // appended (sent or received), but hold the reading position steady
  // when older messages are prepended above it instead of yanking the
  // view back to the top.
  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    if (lastActionRef.current === "prepend") {
      container.scrollTop =
        container.scrollHeight - prevScrollHeightRef.current;
    } else {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:conversation:${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            conversation_id: string;
            sender_id: string;
            content: string;
            created_at: string;
          };

          if (row.sender_id === currentUserId) return;

          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            lastActionRef.current = "append";
            return [
              ...prev,
              {
                id: row.id,
                conversationId: row.conversation_id,
                senderId: row.sender_id,
                content: row.content,
                createdAt: row.created_at,
              },
            ];
          });

          void markConversationReadAction(conversation.id);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversation.id, currentUserId]);

  function handleLoadEarlier() {
    const oldest = messages[0];
    if (!oldest || oldest.pending) return;

    startLoadEarlierTransition(async () => {
      const result = await loadEarlierMessagesAction(
        conversation.id,
        oldest.createdAt,
      );
      if (result.success) {
        const container = scrollRef.current;
        prevScrollHeightRef.current = container ? container.scrollHeight : 0;
        lastActionRef.current = "prepend";
        setHasMore(result.hasMore);
        setMessages((prev) => [...result.messages, ...prev]);
      }
    });
  }

  function sendContent(clientId: string, content: string) {
    startSendTransition(async () => {
      const result = await sendMessageAction(conversation.id, content);

      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== clientId) return m;
          if (!result.success) return { ...m, pending: false, failed: true };
          return { ...result.message, pending: false };
        }),
      );
    });
  }

  function handleSend(content: string) {
    const clientId = `pending-${crypto.randomUUID()}`;
    lastActionRef.current = "append";
    setMessages((prev) => [
      ...prev,
      {
        id: clientId,
        conversationId: conversation.id,
        senderId: currentUserId,
        content,
        createdAt: new Date().toISOString(),
        pending: true,
      },
    ]);

    sendContent(clientId, content);
  }

  function handleRetry(message: ThreadMessage) {
    lastActionRef.current = "append";
    setMessages((prev) =>
      prev.map((m) =>
        m.id === message.id ? { ...m, pending: true, failed: false } : m,
      ),
    );
    sendContent(message.id, message.content);
  }

  return (
    <>
      <div className="border-border flex items-center gap-3 border-b p-4">
        <Link
          href={basePath}
          aria-label="Back to conversations"
          className="rounded-control flex size-8 shrink-0 items-center justify-center text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 md:hidden"
        >
          <ArrowLeft className="size-4" aria-hidden />
        </Link>

        <div className="rounded-card border-border flex size-9 shrink-0 items-center justify-center overflow-hidden border bg-gray-100">
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
          <p className="text-small truncate font-semibold text-gray-900">
            {conversation.startup.name || "Untitled startup"}
          </p>
          <p className="text-caption truncate text-gray-500">
            {conversation.otherParticipant.fullName}
          </p>
        </div>

        {startupProfileHref && (
          <Link
            href={startupProfileHref}
            className="text-caption text-primary hidden shrink-0 items-center gap-1 hover:underline sm:flex"
          >
            View startup
            <ExternalLink className="size-3" aria-hidden />
          </Link>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {hasMore && (
          <div className="mb-4 flex justify-center">
            <button
              type="button"
              onClick={handleLoadEarlier}
              disabled={isLoadingEarlier}
              className="rounded-control text-caption text-primary font-medium hover:underline disabled:opacity-50"
            >
              {isLoadingEarlier ? "Loading\u2026" : "Load earlier messages"}
            </button>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
            <p className="text-small font-medium text-gray-900">
              No messages yet
            </p>
            <p className="text-caption max-w-xs text-gray-500">
              Send the first message to {conversation.otherParticipant.fullName}
              .
            </p>
          </div>
        ) : (
          <div
            aria-live="polite"
            aria-relevant="additions"
            className="flex flex-col gap-2"
          >
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === currentUserId}
                onRetry={
                  message.failed ? () => handleRetry(message) : undefined
                }
              />
            ))}
          </div>
        )}
      </div>

      <MessageComposer onSend={handleSend} disabled={isSending} />
    </>
  );
}

export { ConversationThread };
