import { Container } from "@/components/shared/container";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * My Interests' loading state (Investor side) - added in the
 * pre-launch hardening pass. Mirrors InterestCard's grid-cols-1
 * sm:grid-cols-2 lg:grid-cols-3 layout.
 */
export default function InvestorInterestsLoading() {
  return (
    <Container className="py-10 sm:py-12">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-12 shrink-0 rounded-card" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-5 w-16 shrink-0" />
            </div>
            <Skeleton className="h-3 w-3/4" />
          </Card>
        ))}
      </div>
    </Container>
  );
}
