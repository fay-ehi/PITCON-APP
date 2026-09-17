import { Container } from "@/components/shared/container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Investor public profile's loading state - see
 * app/investor/founders/[founderId]/loading.tsx (this page's twin) for
 * why this route needed one. Mirrors this page's actual shape: "At a
 * glance" (5 fields) on the left, "About", "Investment preferences",
 * and the engagement-stats/report card on the right.
 */
export default function InvestorPublicProfileLoading() {
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
              {Array.from({ length: 5 }).map((_, index) => (
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
            <CardHeader>
              <Skeleton className="h-4 w-44" />
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3 w-16" />
                <div className="flex gap-2">
                  <Skeleton className="h-7 w-20 rounded-pill" />
                  <Skeleton className="h-7 w-24 rounded-pill" />
                  <Skeleton className="h-7 w-16 rounded-pill" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3 w-28" />
                <div className="flex gap-2">
                  <Skeleton className="h-7 w-20 rounded-pill" />
                  <Skeleton className="h-7 w-16 rounded-pill" />
                </div>
              </div>
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
