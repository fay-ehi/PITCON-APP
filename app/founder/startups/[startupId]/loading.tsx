import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Startup view page's loading state - added in the pre-launch hardening
 * pass. Mirrors the name/status header + StartupPreview content block.
 */
export default function StartupViewLoading() {
  return (
    <Container className="max-w-2xl py-12">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-20 rounded-pill" />
        </div>
        <Skeleton className="h-9 w-28 shrink-0" />
      </div>

      <div className="mt-8 flex flex-col gap-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </Container>
  );
}
