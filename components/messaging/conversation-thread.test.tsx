import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ConversationThread } from "@/components/messaging/conversation-thread";
import type { ConversationDetail } from "@/types/message";

/**
 * The "message send/retry path" test the audit asked for. Exercises
 * ConversationThread + MessageComposer + MessageBubble together exactly
 * as a user would: type, send, watch it fail, retry, watch it succeed -
 * see conversation-thread.tsx's own "SENDING" comment for the behavior
 * this is pinning down.
 *
 * Mocks the two things this component reaches outside itself for:
 * the server action (so we control success/failure per call) and the
 * Supabase Realtime client (so a real websocket is never attempted in
 * a test environment - see the mock below for what it actually needs
 * to support).
 */

const { sendMessageAction, markConversationReadAction } = vi.hoisted(() => ({
  sendMessageAction: vi.fn(),
  markConversationReadAction: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/messages/message-actions", () => ({
  sendMessageAction,
  markConversationReadAction,
  loadEarlierMessagesAction: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    channel: () => ({
      on: () => ({ subscribe: () => ({}) }),
    }),
    removeChannel: () => {},
  }),
}));

const conversation: ConversationDetail = {
  id: "conversation-1",
  startup: { id: "startup-1", name: "Analytical Engines Inc.", logoUrl: null },
  otherParticipant: { id: "investor-1", fullName: "Ada Lovelace", avatarUrl: null, verified: false },
};

function renderThread() {
  return render(
    <ConversationThread
      basePath="/founder/messages"
      role="founder"
      conversation={conversation}
      initialMessages={[]}
      hasMoreMessages={false}
      currentUserId="founder-1"
      startupProfileHref={null}
    />,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ConversationThread send/retry", () => {
  it("shows a pending bubble immediately, then a failed state with Retry when the send fails", async () => {
    let resolveSend: (value: Awaited<ReturnType<typeof sendMessageAction>>) => void;
    sendMessageAction.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveSend = resolve;
      }),
    );

    const user = userEvent.setup();
    renderThread();

    await user.type(screen.getByRole("textbox", { name: /message/i }), "Hello there");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    // Optimistic bubble appears immediately, before the action resolves.
    expect(await screen.findByText("Hello there")).toBeInTheDocument();
    expect(screen.getByText("Sending…")).toBeInTheDocument();

    resolveSend!({ success: false, error: "Network error" });

    expect(await screen.findByText("Couldn't send.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(sendMessageAction).toHaveBeenCalledExactlyOnceWith(
      conversation.id,
      "Hello there",
    );
  });

  it("resends the same content on Retry and clears the failed state on success", async () => {
    sendMessageAction.mockResolvedValueOnce({ success: false, error: "Network error" });

    const user = userEvent.setup();
    renderThread();

    await user.type(screen.getByRole("textbox", { name: /message/i }), "Hello there");
    await user.click(screen.getByRole("button", { name: /send message/i }));
    await screen.findByRole("button", { name: "Retry" });

    sendMessageAction.mockResolvedValueOnce({
      success: true,
      message: {
        id: "message-1",
        conversationId: conversation.id,
        senderId: "founder-1",
        content: "Hello there",
        createdAt: new Date().toISOString(),
      },
    });

    await user.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(screen.queryByText("Couldn't send.")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Hello there")).toBeInTheDocument();
    expect(sendMessageAction).toHaveBeenCalledTimes(2);
    expect(sendMessageAction).toHaveBeenNthCalledWith(2, conversation.id, "Hello there");
  });

  it("marks the conversation read on open", () => {
    renderThread();
    expect(markConversationReadAction).toHaveBeenCalledWith(conversation.id);
  });
});
