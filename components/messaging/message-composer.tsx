"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MESSAGE_MAX_LENGTH } from "@/lib/validations/message";

/**
 * The message input at the bottom of an open conversation - per the
 * brief's "MESSAGE COMPOSER": text input, send action, Enter-to-send,
 * Shift+Enter for a newline, disabled while empty, disabled while a send
 * is in flight (`disabled`, passed down from `ConversationThread`'s own
 * pending-send state).
 *
 * Owns its own input value; `ConversationThread` only learns about a
 * message once `onSend` fires. Clears itself immediately on submit
 * rather than waiting for the send to resolve, so typing the next
 * message never has to wait on the network.
 */
function MessageComposer({
  onSend,
  disabled,
}: {
  onSend: (content: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const trimmed = value.trim();
  const canSend =
    trimmed.length > 0 && trimmed.length <= MESSAGE_MAX_LENGTH && !disabled;

  function submit() {
    if (!canSend) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <div className="border-border flex items-end gap-2 border-t p-3">
      <Textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
        placeholder="Type a message..."
        rows={1}
        maxLength={MESSAGE_MAX_LENGTH}
        aria-label="Message"
        className="min-h-10 flex-1 resize-none py-2"
      />
      <Button
        type="button"
        size="icon"
        onClick={submit}
        disabled={!canSend}
        aria-label="Send message"
      >
        <Send className="size-4" aria-hidden />
      </Button>
    </div>
  );
}

export { MessageComposer };
