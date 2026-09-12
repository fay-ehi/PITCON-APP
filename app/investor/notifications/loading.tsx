import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Notifications' loading state (Investor side) - added in the
 * pre-launch hardening pass. Mirrors NotificationList's row shape,
 * same as the founder-side loading skeleton.
 */
export default function InvestorNotificationsLoading() {
  return (
    <Container className="py-10 sm:py-12">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="mt-8 flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-start gap-3 rounded-card border border-border p-4"
          >
            <Skeleton className="mt-1.5 size-2 shrink-0 rounded-pill" />
            <Skeleton className="size-9 shrink-0 rounded-pill" />
            <div className="min-w-0 flex-1 flex flex-col gap-2">
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
