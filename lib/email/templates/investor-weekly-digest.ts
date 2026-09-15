import { escapeHtml, renderEmailShell, renderEmailText } from "@/lib/email/shell";

export interface InvestorWeeklyDigestInput {
  fullName: string;
  newStartupCount: number;
  /** Up to 3 names, for a concrete taste of what's new rather than
   * just a bare count. */
  sampleStartupNames: string[];
  /** Whether `newStartupCount` was narrowed to the investor's saved
   * industry/stage preferences (Sprint 2's `investor_industry_
   * preferences`/`investor_stage_preferences`, collected at onboarding
   * but - until this digest - never actually used anywhere in the
   * app). Changes the copy from "new on PITCON" to "matching your
   * preferences" so an investor who set them sees they're doing
   * something, not just decoration on a form. */
  matchedPreferences: boolean;
  discoverUrl: string;
}

/**
 * Sprint 16 - see founder-weekly-digest.ts's own comment for the
 * "doubles as re-engagement" reasoning, which applies here too.
 */
export function investorWeeklyDigestEmail({
  fullName,
  newStartupCount,
  sampleStartupNames,
  matchedPreferences,
  discoverUrl,
}: InvestorWeeklyDigestInput) {
  const safeName = escapeHtml(fullName);
  const heading = "New on PITCON this week";

  const qualifier = matchedPreferences ? "matching your preferences" : "published";
  const namesList = sampleStartupNames.map(escapeHtml).join(", ");

  const bodyText = `Hi ${safeName}, <strong>${newStartupCount}</strong> new startup${newStartupCount === 1 ? "" : "s"} ${qualifier} this week${namesList ? `, including ${namesList}` : ""}.`;
  const plainBody = `Hi ${fullName}, ${newStartupCount} new startup${newStartupCount === 1 ? "" : "s"} ${qualifier} this week${sampleStartupNames.length > 0 ? `, including ${sampleStartupNames.join(", ")}` : ""}.`;

  const button = { text: "Browse Discover", href: discoverUrl };
  const footerText = matchedPreferences
    ? "You're receiving this because these startups match your saved industry/stage preferences on PITCON."
    : "You're receiving this weekly summary because you're an investor on PITCON.";

  return {
    subject: heading,
    html: renderEmailShell({ heading, bodyText, button, footerText }),
    text: renderEmailText({ heading, bodyText: plainBody, button, footerText }),
  };
}
