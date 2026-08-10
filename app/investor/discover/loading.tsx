import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Discover's loading state - per the Sprint 5 brief's "LOADING STATES"
 * ("Use appropriate skeleton states... Do not rely only on a giant
 * spinner"). Next.js renders this automatically for the initial visit
 * and for any navigation that re-fetches this route segment, including
 * search/filter changes (same route, new search params).
 */
export default function DiscoverLoading() {
  return (
    <Container className="py-8 sm:py-10">
      <div className="mb-6 flex flex-col gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-full" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 rounded-card border border-border bg-white p-5"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-12 shrink-0 rounded-card" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>

        <div className="hidden lg:block">
          <Skeleton className="h-[32rem] w-full" />
        </div>
      </div>
    </Container>
  );
}
