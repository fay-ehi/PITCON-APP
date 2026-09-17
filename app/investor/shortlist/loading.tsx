import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * My Shortlist's loading state - this route was missing one entirely
 * (every sibling route under /investor and /founder has a loading.tsx;
 * this was the one gap). Mirrors ShortlistCard's shape: a logo square,
 * name/meta lines, a funding line, and the "Shortlisted X ago" line,
 * in the same grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 layout as the
 * real grid.
 */
export default function InvestorShortlistLoading() {
  return (
    <Container className="py-10 sm:py-12">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-card flex flex-col gap-3 bg-white p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="size-12 shrink-0 rounded-card" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    </Container>
  );
}
