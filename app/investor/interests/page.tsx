import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";

import { getCurrentUserProfile } from "@/lib/auth/session";
import { getInvestorInterests } from "@/lib/queries/interests";
import { Container } from "@/components/shared/container";
import { Card, CardContent } from "@/components/ui/card";
import { InterestCard } from "@/components/investor/interest-card";

export const metadata: Metadata = {
  title: "My Interests",
};

/**
 * The Investor's "My Interests" destination - Sprint 6's answer to the
 * brief's "INVESTOR INTERESTS" section ("The Investor needs a place to
 * see the interests they have submitted"). No agreed location already
 * existed for this (Sprint 5 only shipped Discover), and the Investor
 * application has no sidebar to add a nav item to (Sprint 5's explicit
 * product decision, restated in this sprint's brief) - reached instead
 * via the Heart icon in `InvestorTopBar`, alongside Messages/
 * Notifications, rather than introducing one.
 *
 * A flat list, one card per interest (never grouped/merged by startup or
 * investor) - deliberately not a "social feed": no other investors'
 * activity, no counts, nothing beyond this investor's own submissions
 * and their status.
 */
export default async function InvestorInterestsPage() {
  const current = await getCurrentUserProfile();
  if (!current) redirect("/login?next=/investor/interests");

  const interests = await getInvestorInterests(current.userId);

  return (
    <Container className="py-10 sm:py-12">
      <h1 className="text-h2 text-gray-900">My Interests</h1>
      <p className="text-small mt-1 text-gray-500">
        Startups you&apos;ve expressed interest in, and where each stands.
      </p>

      {interests.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {interests.map((interest) => (
            <InterestCard key={interest.id} interest={interest} />
          ))}
        </div>
      ) : (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="rounded-pill bg-primary-50 flex size-14 items-center justify-center">
              <Heart className="text-primary size-6" aria-hidden />
            </div>
            <div>
              <p className="text-small font-medium text-gray-900">No interests yet</p>
              <p className="text-caption mt-1 max-w-xs text-gray-500">
                When you express interest in a startup from Discover, it&apos;ll
                show up here with its status.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
