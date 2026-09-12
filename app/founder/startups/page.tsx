import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUserProfile } from "@/lib/auth/session";
import { getStartupsForFounder } from "@/lib/queries/startup";
import { Container } from "@/components/shared/container";
import { AddStartupButton } from "@/components/startup/add-startup-button";
import { StartupCard } from "@/components/startup/startup-card";
import { StartupEmptyState } from "@/components/startup/startup-empty-state";
import { MyStartupsDecoration } from "@/components/founder/my-startups-decoration";
import { FounderProductTour } from "@/components/onboarding/founder-product-tour";

export const metadata: Metadata = {
  title: "My Startups",
};

/**
 * The Founder workspace's default landing section (Sprint 4 brief:
 * "My Startups selected by default" on login). Lives at
 * `/founder/startups` — a real, bookmarkable/refreshable route inside
 * the shared app shell from `app/founder/layout.tsx`, not a client-side
 * view toggled from a generic "/founder" dashboard.
 *
 * Fetches *all* of the founder's startups in one call
 * (`getStartupsForFounder`) rather than any single-startup lookup — see
 * the Sprint 4 brief's "MULTI-STARTUP REQUIREMENT" and "DATA FETCHING"
 * sections on avoiding `.single()`/`findUnique`-shaped assumptions here.
 *
 * As of Sprint 10, this is also where the first-time product tour
 * appears - per that brief's "BACKGROUND APPLICATION" section, it's
 * shown over whatever the founder's actual landing workspace is, which
 * is this page. `current.profile.product_tour_completed` comes from
 * the same authenticated profile row already fetched above, so showing
 * the tour costs no extra query.
 */
export default async function MyStartupsPage() {
  const current = await getCurrentUserProfile();
  if (!current) redirect("/login?next=/founder/startups");

  const startups = await getStartupsForFounder(current.userId);
  const hasStartups = startups.length > 0;

  return (
    <Container className="relative py-10 sm:py-12">
      <FounderProductTour
        initiallyCompleted={current.profile.product_tour_completed}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-h2 text-gray-900">My Startups</h1>
          
        </div>
        {hasStartups && <AddStartupButton label="Add Startup" />}
      </div>

      <div className="mt-8">
        {hasStartups ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {startups.map((startup) => (
              <StartupCard key={startup.id} startup={startup} />
            ))}
          </div>
        ) : (
          <StartupEmptyState />
        )}
      </div>

      <MyStartupsDecoration className="pointer-events-none absolute right-6 bottom-6 hidden lg:block" />
    </Container>
  );
}
