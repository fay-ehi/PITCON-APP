import { Container } from "@/components/shared/container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Founder profile view's loading state - added in the pre-launch
 * hardening pass. Mirrors ProfileHeader + the Professional
 * information/Links cards below it.
 */
export default function FounderProfileLoading() {
  return (
    <Container className="max-w-2xl py-12">
      <div className="flex items-center gap-4">
        <Skeleton className="size-16 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3.5 w-28" />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-16" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-48" />
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
