import { escapeHtml, renderEmailShell, renderEmailText } from "@/lib/email/shell";

export interface FounderWeeklyDigestInput {
  fullName: string;
  /** Total across every published startup this founder has. */
  viewCount: number;
  uniqueInvestorCount: number;
  newInterestCount: number;
  /** Name of an unpublished draft, if the founder has one - takes
   * priority in the copy over the stats above, since a draft getting
   * zero views is expected (it's invisible in Discover), not something
   * to report as if it were a quiet week. */
  incompleteDraftName: string | null;
  dashboardUrl: string;
}

/**
 * Sprint 16 - the "weekly digest" from the roadmap conversation,
 * built to double as the "re-engagement digest for inactive users"
 * README's Roadmap section has named as missing since the pre-launch
 * pass. One mechanism serves both: `sendWeeklyDigests` (see
 * lib/digest/weekly-digest.ts) only sends this to a founder who has
 * something real to report - genuine view/interest activity, or an
 * unfinished draft - so a founder who's been away and comes back to
 * new investor interest gets pulled back by the content itself, no
 * separate "you've been inactive" detection needed.
 */
export function founderWeeklyDigestEmail({
  fullName,
  viewCount,
  uniqueInvestorCount,
  newInterestCount,
  incompleteDraftName,
  dashboardUrl,
}: FounderWeeklyDigestInput) {
  const safeName = escapeHtml(fullName);
  const heading = "Your week on PITCON";

  const parts: string[] = [];
  if (incompleteDraftName) {
    parts.push(
      `<strong>${escapeHtml(incompleteDraftName)}</strong> is still a draft - investors can't see it until you publish it.`,
    );
  }
  if (viewCount > 0) {
    const investorPhrase =
      uniqueInvestorCount > 0
        ? ` from ${uniqueInvestorCount} investor${uniqueInvestorCount === 1 ? "" : "s"}`
        : "";
    parts.push(
      `<strong>${viewCount}</strong> profile view${viewCount === 1 ? "" : "s"}${investorPhrase} this week.`,
    );
  }
  if (newInterestCount > 0) {
    parts.push(
      `<strong>${newInterestCount}</strong> new investor interest${newInterestCount === 1 ? "" : "s"} - worth a reply.`,
    );
  }

  const bodyText = `Hi ${safeName}, here's what happened this week:<br/><br/>${parts.join("<br/>")}`;
  const plainParts = parts.map((p) => p.replace(/<\/?strong>/g, ""));
  const plainBody = `Hi ${fullName}, here's what happened this week:\n\n${plainParts.join("\n")}`;

  const button = { text: "Open your dashboard", href: dashboardUrl };
  const footerText = "You're receiving this weekly summary because you're a founder on PITCON.";

  return {
    subject: "Your week on PITCON",
    html: renderEmailShell({ heading, bodyText, button, footerText }),
    text: renderEmailText({ heading, bodyText: plainBody, button, footerText }),
  };
}
