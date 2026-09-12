import { Container } from "@/components/shared/container";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * My Startups' loading state - added in the pre-launch hardening pass.
 * Mirrors the sm:grid-cols-2 xl:grid-cols-3 StartupCard grid.
 */
export default function MyStartupsLoading() {
  return (
    <Container className="py-10 sm:py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-12 shrink-0 rounded-card" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="mt-2 h-8 w-full" />
          </Card>
        ))}
      </div>
    </Container>
  );
}
