import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Founder onboarding's loading state - added in the pre-launch
 * hardening pass. Mirrors FounderProfileForm's shape (a stack of
 * labeled fields).
 */
export default function FounderOnboardingLoading() {
  return (
    <Container className="max-w-2xl py-12">
      <div className="mb-8 flex flex-col gap-2">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      <div className="flex flex-col gap-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <Skeleton className="mt-2 h-10 w-32" />
      </div>
    </Container>
  );
}
