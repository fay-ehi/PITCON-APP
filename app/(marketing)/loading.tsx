import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Marketing home page's loading state - added in the pre-launch
 * hardening pass. The page's own data fetch (the signed-in redirect
 * check) is fast, but this still gives a real first paint instead of a
 * blank tab on a cold navigation.
 */
export default function MarketingLoading() {
  return (
    <Container className="flex flex-col items-center gap-6 py-20 text-center">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-12 w-full max-w-2xl" />
      <Skeleton className="h-5 w-full max-w-lg" />
      <div className="flex gap-3">
        <Skeleton className="h-11 w-36" />
        <Skeleton className="h-11 w-36" />
      </div>
    </Container>
  );
}
