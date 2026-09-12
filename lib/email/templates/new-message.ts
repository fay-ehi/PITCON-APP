import { escapeHtml, renderEmailShell, renderEmailText } from "@/lib/email/shell";

export interface NewMessageEmailInput {
  senderName: string;
  startupName: string;
  messagePreview: string;
  conversationUrl: string;
}

/** Trims to a sentence-ish length so the preview can't blow up the email with a huge pasted message. */
function truncatePreview(text: string, maxLength = 160): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trimEnd()}…`;
}

/**
 * "You have a new message" - there's no in-app `notifications` row for
 * this yet (the Sprint 6 migration scoped that table to interest events
 * only), so this email is currently the *only* out-of-band signal
 * either side gets for a new message. Sent from `sendMessageAction`
 * for whichever participant didn't send it.
 */
export function newMessageEmail({
  senderName,
  startupName,
  messagePreview,
  conversationUrl,
}: NewMessageEmailInput) {
  const safeSenderName = escapeHtml(senderName);
  const safeStartupName = escapeHtml(startupName);
  const safePreview = escapeHtml(truncatePreview(messagePreview));

  const heading = "New message";
  const bodyText = `${safeSenderName} sent you a message about <strong>${safeStartupName}</strong>:<div style="margin: 12px 0 0; padding: 16px; background-color: #fafafa; border-radius: 8px; font-style: italic; color: #404040;">"${safePreview}"</div>`;
  const button = { text: "Reply", href: conversationUrl };
  const footerText = `You're receiving this because you have an active conversation about ${safeStartupName} on PITCON.`;

  return {
    subject: `New message from ${senderName}`,
    html: renderEmailShell({ heading, bodyText, button, footerText }),
    text: renderEmailText({
      heading,
      bodyText: `${senderName} sent you a message about ${startupName}: "${truncatePreview(messagePreview)}"`,
      button,
      footerText: `You're receiving this because you have an active conversation about ${startupName} on PITCON.`,
    }),
  };
}
