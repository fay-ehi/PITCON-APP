import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUserProfile } from "@/lib/auth/session";
import { getShortlistedStartups } from "@/lib/queries/shortlist";
import { Container } from "@/components/shared/container";
import { ShortlistWorkspace } from "@/components/investor/shortlist-workspace";

export const metadata: Metadata = {
  title: "My Shortlist",
};

/**
 * The Investor's "My Shortlist" destination - Sprint 12. Mirrors
 * `/investor/interests`'s shape closely (a flat grid of cards, reached
 * via a topbar icon rather than a sidebar item, since the Investor
 * application still has no sidebar - see that page's own comment for
 * why): startups the investor has bookmarked from Discover to revisit,
 * never merged with or ranked against interest status.
 *
 * The actual grid/empty-state rendering and "remove from shortlist"
 * interaction live in `ShortlistWorkspace`, a client component -
 * needed here (unlike the read-only Interests list) because removing a
 * card should update this page's own list immediately, without a full
 * reload - including emptying out entirely if the investor removes
 * their last shortlisted startup in the same session, which is why
 * that component owns its own empty state too rather than this page
 * only handling the "never shortlisted anything" case.
 */
export default async function InvestorShortlistPage() {
  const current = await getCurrentUserProfile();
  if (!current) redirect("/login?next=/investor/shortlist");

  const shortlist = await getShortlistedStartups(current.userId);

  return (
    <Container className="py-10 sm:py-12">
      <h1 className="text-h2 text-gray-900">My Shortlist</h1>
      <p className="text-small mt-1 text-gray-500">
        Startups you&apos;ve saved from Discover to revisit later.
      </p>

      <ShortlistWorkspace initialShortlist={shortlist} className="mt-8" />
    </Container>
  );
}
