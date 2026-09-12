import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Edit founder profile's loading state - mirrors the page's back-link
 * header plus FounderProfileForm's field stack.
 */
export default function EditFounderProfileLoading() {
  return (
    <Container className="max-w-3xl py-10 sm:py-12">
      <div className="mb-8 flex items-center gap-3">
        <Skeleton className="size-9 shrink-0 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3.5 w-64" />
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <Skeleton className="mt-2 h-10 w-28" />
      </div>
    </Container>
  );
}
