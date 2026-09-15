import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteURL } from "@/lib/site-url";
import { sendEmail } from "@/lib/email/send-email";
import { interestReceivedEmail } from "@/lib/email/templates/interest-received";
import { newMessageEmail } from "@/lib/email/templates/new-message";

/**
 * Server-only. Looks up a user's email + display name via the admin
 * client (see its own comment for why this needs the service role) and
 * hands back `null` rather than throwing when either lookup comes back
 * empty, so a missing/deleted user just means "don't send" instead of
 * an unhandled exception in a best-effort notification path.
 *
 * Exported (originally private to this file) once the Sprint 16 weekly
 * digest needed the exact same lookup for every founder/investor being
 * sent one, not just the one recipient of a single-user notification.
 */
export async function getEmailRecipient(userId: string): Promise<{ email: string; fullName: string } | null> {
  const admin = createAdminClient();

  const [{ data: userData, error: userError }, { data: profile, error: profileError }] = await Promise.all([
    admin.auth.admin.getUserById(userId),
    admin.from("profiles").select("full_name").eq("id", userId).maybeSingle(),
  ]);

  if (userError || !userData.user?.email) {
    console.error(`[email] Couldn't look up auth email for user ${userId}:`, userError);
    return null;
  }
  if (profileError) {
    console.error(`[email] Couldn't look up profile for user ${userId}:`, profileError);
    return null;
  }

  return { email: userData.user.email, fullName: profile?.full_name ?? "there" };
}

/**
 * "An investor is interested in your startup" - called from
 * `expressInterestAction` after the interest is successfully recorded.
 * `startupName` falls back to a generic label since `startups.name` is
 * nullable (a startup could theoretically reach `published` without one
 * in the current schema, even though the publish flow's own validation
 * shouldn't allow that in practice) - a slightly generic email beats a
 * broken one.
 */
export async function sendInterestReceivedEmail(input: {
  founderId: string;
  investorName: string;
  startupName: string | null;
}): Promise<void> {
  const recipient = await getEmailRecipient(input.founderId);
  if (!recipient) return;

  const { subject, html, text } = interestReceivedEmail({
    investorName: input.investorName,
    startupName: input.startupName ?? "your startup",
    interestsUrl: `${getSiteURL()}/founder/interests`,
  });

  await sendEmail({ to: recipient.email, subject, html, text });
}

/**
 * "You have a new message" - called from `sendMessageAction` for
 * whichever participant didn't just send the message. `recipientRole`
 * picks the right workspace for the reply link (founder and investor
 * have separate `/messages` routes) - see that action for how it's
 * determined.
 */
export async function sendNewMessageEmail(input: {
  recipientId: string;
  recipientRole: "founder" | "investor";
  senderName: string;
  startupName: string | null;
  messagePreview: string;
}): Promise<void> {
  const recipient = await getEmailRecipient(input.recipientId);
  if (!recipient) return;

  const { subject, html, text } = newMessageEmail({
    senderName: input.senderName,
    startupName: input.startupName ?? "a startup",
    messagePreview: input.messagePreview,
    conversationUrl: `${getSiteURL()}/${input.recipientRole}/messages`,
  });

  await sendEmail({ to: recipient.email, subject, html, text });
}
