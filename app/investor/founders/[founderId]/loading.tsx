import { Container } from "@/components/shared/container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Founder public profile's loading state - this route (and its
 * `/founder/investors/[investorId]` twin) was missing one; every other
 * dynamic detail route in the app already has one (e.g.
 * app/founder/startups/[startupId]/loading.tsx). Mirrors this page's
 * actual shape (same ProfileHeader-hero convention as the self-view
 * profile loading states): "At a glance" (3 fields) on the left, "About"
 * plus the engagement-stats/report card on the right.
 */
export default function FounderPublicProfileLoading() {
  return (
    <Container className="max-w-4xl py-10 sm:py-12">
      <Skeleton className="h-36 w-full rounded-2xl sm:h-32" />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <Skeleton className="h-4 w-28" />
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="size-9 shrink-0 rounded-full" />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-4 w-16" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}
