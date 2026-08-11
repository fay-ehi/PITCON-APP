import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";

import { getCurrentUserProfile } from "@/lib/auth/session";
import { getFounderInterests } from "@/lib/queries/interests";
import { Container } from "@/components/shared/container";
import { Card, CardContent } from "@/components/ui/card";
import { InterestRow } from "@/components/founder/interest-row";

export const metadata: Metadata = {
  title: "Interests",
};

/**
 * Interests workspace - answers "which investors have expressed
 * interest in my startups?", per the brief. Deliberately distinct from
 * Notifications: this is the full, detailed investor-interest record
 * (investor, startup, date, status); Notifications is a chronological
 * event feed that happens to include interest events among others.
 *
 * As of Sprint 6, this reads real `startup_interests` rows (see
 * lib/queries/interests.ts's `getFounderInterests`) - previously this
 * always rendered the "no investor interest yet" placeholder, since no
 * matchmaking backend existed until this sprint. One row per interest,
 * not per investor or per startup: the brief's "MULTIPLE STARTUPS"
 * section requires the same investor's interest in two different
 * startups - even both owned by this founder - to stay fully separate,
 * which falls out for free since each `startup_interests` row already
 * is exactly one investor+startup relationship.
 */
export default async function InterestsPage() {
  const current = await getCurrentUserProfile();
  if (!current) redirect("/login?next=/founder/interests");

  const interests = await getFounderInterests(current.userId);

  return (
    <Container className="py-10 sm:py-12">
      <h1 className="text-h2 text-gray-900">Interests</h1>
      <p className="text-small mt-1 text-gray-500">
        Investors who have expressed interest in your startups.
      </p>

      {interests.length > 0 ? (
        <div className="mt-8 flex flex-col gap-3">
          {interests.map((interest) => (
            <InterestRow key={interest.id} interest={interest} />
          ))}
        </div>
      ) : (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="rounded-pill bg-primary-50 flex size-14 items-center justify-center">
              <Heart className="text-primary size-6" aria-hidden />
            </div>
            <div>
              <p className="text-small font-medium text-gray-900">
                No investor interest yet
              </p>
              <p className="text-caption mt-1 max-w-xs text-gray-500">
                Once an investor expresses interest in one of your startups,
                it&apos;ll show up here with which startup, when, and its status.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
