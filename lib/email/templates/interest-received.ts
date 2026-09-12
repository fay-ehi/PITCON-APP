import { escapeHtml, renderEmailShell, renderEmailText } from "@/lib/email/shell";

export interface InterestReceivedEmailInput {
  investorName: string;
  startupName: string;
  interestsUrl: string;
}

/**
 * "An investor is interested in your startup" - the email half of the
 * `interest_received` in-app notification created by the
 * Sprint 6 migration's trigger. Sent from `expressInterestAction`
 * itself rather than off a database webhook - see that action's own
 * comment for why.
 */
export function interestReceivedEmail({
  investorName,
  startupName,
  interestsUrl,
}: InterestReceivedEmailInput) {
  const safeInvestorName = escapeHtml(investorName);
  const safeStartupName = escapeHtml(startupName);

  const heading = "You've got investor interest";
  const bodyText = `${safeInvestorName} is interested in <strong>${safeStartupName}</strong>. Review their profile and respond from your Interests page.`;
  const button = { text: "View interest", href: interestsUrl };
  const footerText = `You're receiving this because an investor expressed interest in ${safeStartupName} on PITCON.`;

  return {
    subject: `${investorName} is interested in ${startupName}`,
    html: renderEmailShell({ heading, bodyText, button, footerText }),
    text: renderEmailText({
      heading,
      bodyText: `${investorName} is interested in ${startupName}. Review their profile and respond from your Interests page.`,
      button,
      footerText: `You're receiving this because an investor expressed interest in ${startupName} on PITCON.`,
    }),
  };
}
