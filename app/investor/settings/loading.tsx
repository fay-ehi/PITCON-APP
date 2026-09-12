import { Container } from "@/components/shared/container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Investor settings' loading state - added in the pre-launch hardening
 * pass. Mirrors the Account + Account actions cards, same as the
 * founder-side loading skeleton.
 */
export default function InvestorSettingsLoading() {
  return (
    <Container className="max-w-2xl py-10 sm:py-12">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="mt-8 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3.5 w-40" />
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-24" />
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
