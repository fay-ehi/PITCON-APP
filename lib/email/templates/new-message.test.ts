import { describe, expect, it } from "vitest";

import { newMessageEmail } from "@/lib/email/templates/new-message";

describe("newMessageEmail", () => {
  it("includes the sender's name in the subject", () => {
    const { subject } = newMessageEmail({
      senderName: "Grace Hopper",
      startupName: "Compiler Co.",
      messagePreview: "Hi, I'd love to learn more.",
      conversationUrl: "https://pitcon.example/investor/messages",
    });
    expect(subject).toBe("New message from Grace Hopper");
  });

  it("truncates a long message preview rather than including it in full", () => {
    const longMessage = "a".repeat(500);
    const { html, text } = newMessageEmail({
      senderName: "Grace Hopper",
      startupName: "Compiler Co.",
      messagePreview: longMessage,
      conversationUrl: "https://pitcon.example/investor/messages",
    });
    expect(html).not.toContain(longMessage);
    expect(text).not.toContain(longMessage);
    // Ends with an ellipsis to signal there's more, not just a hard cut.
    expect(html).toContain("…");
  });

  it("does not truncate a short message preview", () => {
    const { html } = newMessageEmail({
      senderName: "Grace Hopper",
      startupName: "Compiler Co.",
      messagePreview: "Short message.",
      conversationUrl: "https://pitcon.example/investor/messages",
    });
    expect(html).toContain("Short message.");
  });

  it("escapes HTML in the message preview", () => {
    const { html } = newMessageEmail({
      senderName: "Grace Hopper",
      startupName: "Compiler Co.",
      messagePreview: "<img src=x onerror=alert(1)>",
      conversationUrl: "https://pitcon.example/investor/messages",
    });
    expect(html).not.toContain("<img src=x onerror=alert(1)>");
    expect(html).toContain("&lt;img");
  });
});
