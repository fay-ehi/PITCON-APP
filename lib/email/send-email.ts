import { getResendClient } from "@/lib/email/resend";

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * The one place in the app that actually calls Resend. Deliberately
 * never throws: every caller is a best-effort side effect of some other
 * action (an investor expressing interest, someone sending a message) -
 * see `lib/email/notifications.ts` - and a flaky email provider should
 * never turn into a failed interest/message for the user. Failures are
 * logged so they're visible in whatever picks up server logs (see the
 * Sentry setup) instead of silently vanishing.
 *
 * `EMAIL_FROM_ADDRESS` defaults to Resend's own sandbox sender, which
 * only delivers to the Resend account's own verified email - fine for
 * confirming the integration works, but you'll want your own verified
 * sending domain before this reaches real users. See .env.example.
 */
export async function sendEmail({ to, subject, html, text }: EmailPayload): Promise<void> {
  const resend = getResendClient();

  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set - skipping "${subject}" to ${to}`);
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM_ADDRESS ?? "PITCON <onboarding@resend.dev>",
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error(`[email] Resend rejected "${subject}" to ${to}:`, error);
    }
  } catch (error) {
    console.error(`[email] Failed to send "${subject}" to ${to}:`, error);
  }
}
