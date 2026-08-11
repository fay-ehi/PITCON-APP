import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Messages' loading state - per the brief's "LOADING STATES" ("Use
 * appropriate skeleton/loading states... Do not use a giant spinner for
 * the entire application"). Mirrors the two-pane shape the real
 * workspace renders into, same reasoning as `DiscoverLoading`.
 */
export default function MessagesLoading() {
  return (
    <Container className="py-10 sm:py-12">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="rounded-card border-border mt-8 grid grid-cols-1 overflow-hidden border bg-white md:h-[36rem] md:grid-cols-[300px_1fr]">
        <div className="border-border flex flex-col gap-3 p-4 md:border-r">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="rounded-card size-10 shrink-0" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>

        <div className="hidden flex-col md:flex">
          <Skeleton className="h-full w-full rounded-none" />
        </div>
      </div>
    </Container>
  );
}
