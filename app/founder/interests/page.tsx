import type { Metadata } from "next";
import { Heart } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Card, CardContent } from "@/components/ui/card";

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
 * No `investor_interest` (or similar) table exists yet - a future
 * sprint (the brief calls out Investor Discovery as explicitly out of
 * scope here). This renders the real "no investor interest yet" state
 * rather than sample rows; the table/card layout described in the
 * brief is straightforward to add once that data exists.
 */
export default function InterestsPage() {
  return (
    <Container className="py-10 sm:py-12">
      <h1 className="text-h2 text-gray-900">Interests</h1>
      <p className="text-small mt-1 text-gray-500">
        Investors who have expressed interest in your startups.
      </p>

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
    </Container>
  );
}
