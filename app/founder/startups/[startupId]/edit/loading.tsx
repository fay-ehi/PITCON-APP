import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Create/Edit startup's loading state - added in the pre-launch
 * hardening pass. Mirrors StartupForm's larger multi-field layout
 * (max-w-4xl, more fields than the profile forms).
 */
export default function EditStartupLoading() {
  return (
    <Container className="max-w-4xl py-12">
      <div className="mb-8 flex flex-col gap-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-6 h-28 w-full" />
      <Skeleton className="mt-6 h-10 w-32" />
    </Container>
  );
}
