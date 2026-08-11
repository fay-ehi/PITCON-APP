import { cn } from "@/lib/utils";
import { formatMessageTime } from "@/lib/format/date";
import type { MessageSummary } from "@/types/message";

type ThreadMessage = MessageSummary & { pending?: boolean; failed?: boolean };

/**
 * One message bubble. Content is rendered as plain interpolated JSX text
 * (never `dangerouslySetInnerHTML`), so React's normal escaping is what
 * satisfies the brief's "Do not allow arbitrary HTML inside messages" /
 * "Prevent accidental HTML/script injection" - there is no markdown or
 * HTML parsing step here to reintroduce that risk. `whitespace-pre-wrap`
 * preserves the sender's line breaks without needing to render anything
 * but a plain string.
 *
 * `isOwn` decides side and color - per the brief's "MESSAGE BUBBLES"
 * ("Do not overuse purple... Purple can be used for the current user's
 * message state"), only the signed-in user's own bubbles use the brand
 * purple; the other participant's are neutral gray.
 */
function MessageBubble({
  message,
  isOwn,
  onRetry,
}: {
  message: ThreadMessage;
  isOwn: boolean;
  onRetry?: () => void;
}) {
  return (
    <div className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}>
      <div
        className={cn(
          "rounded-card text-small max-w-[85%] px-3.5 py-2 break-words whitespace-pre-wrap sm:max-w-[70%]",
          isOwn ? "bg-primary text-white" : "bg-gray-100 text-gray-900",
          message.pending && "opacity-60",
          message.failed &&
            "border-destructive bg-destructive-50 text-destructive border",
        )}
      >
        {message.content}
      </div>
      <div className="text-caption mt-1 flex items-center gap-1.5 px-1 text-gray-400">
        {message.failed ? (
          <>
            <span className="text-destructive">Couldn&apos;t send.</span>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="text-primary font-medium hover:underline"
              >
                Retry
              </button>
            )}
          </>
        ) : message.pending ? (
          "Sending\u2026"
        ) : (
          formatMessageTime(message.createdAt)
        )}
      </div>
    </div>
  );
}

export { MessageBubble };
export type { ThreadMessage };
