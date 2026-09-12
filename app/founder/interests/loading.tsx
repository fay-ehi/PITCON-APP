import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Interests' loading state - added in the pre-launch hardening pass.
 * Mirrors InterestRow's shape (avatar, name/startup line, status +
 * date column) so the list doesn't jump around once real rows arrive.
 */
export default function FounderInterestsLoading() {
  return (
    <Container className="py-10 sm:py-12">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex w-full flex-wrap items-center gap-4 rounded-card border border-border bg-white p-5 sm:flex-nowrap"
          >
            <Skeleton className="size-11 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 flex flex-col gap-2">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
