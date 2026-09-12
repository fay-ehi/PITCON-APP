import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Edit investor profile's loading state - added in the pre-launch
 * hardening pass. Mirrors InvestorProfileForm + InvestorPreferencesForm
 * stacked together, same as this page's real render.
 */
export default function EditInvestorProfileLoading() {
  return (
    <Container className="max-w-2xl py-12">
      <div className="mb-8 flex flex-col gap-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full max-w-sm" />
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-1.5">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-5">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="mt-2 h-10 w-28" />
        </div>
      </div>
    </Container>
  );
}
