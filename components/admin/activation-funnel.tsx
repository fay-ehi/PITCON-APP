import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { FunnelStepCounts } from "@/types/funnel";

const FOUNDER_STEPS: { key: keyof FunnelStepCounts; label: string }[] = [
  { key: "signedUp", label: "Signed up" },
  { key: "profileComplete", label: "Startup ready to publish" },
  { key: "activated", label: "Published" },
  { key: "firstInterest", label: "Received interest" },
  { key: "firstMessage", label: "Sent a message" },
];

const INVESTOR_STEPS: { key: keyof FunnelStepCounts; label: string }[] = [
  { key: "signedUp", label: "Signed up" },
  { key: "profileComplete", label: "Profile complete" },
  { key: "activated", label: "Viewed a startup" },
  { key: "firstInterest", label: "Expressed interest" },
  { key: "firstMessage", label: "Sent a message" },
];

/**
 * Sprint 17 (Product Analytics). Plain CSS bars, same "no charting
 * library for one chart" call as the Founder Analytics trend - see
 * that card's own comment. Bar width is relative to `signedUp` (the
 * funnel's own first step), not to some fixed maximum, so a healthy
 * funnel visibly narrows left-to-right.
 */
function ActivationFunnelCard({
  title,
  counts,
  steps,
}: {
  title: string;
  counts: FunnelStepCounts;
  steps: { key: keyof FunnelStepCounts; label: string }[];
}) {
  const total = counts.signedUp;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {total === 0 ? (
          <p className="text-small text-gray-500">No signups yet.</p>
        ) : (
          steps.map((step, index) => {
            const count = counts[step.key];
            const widthPct = Math.max(4, Math.round((count / total) * 100));
            const previousCount = index > 0 ? counts[steps[index - 1].key] : null;
            const conversionPct =
              previousCount && previousCount > 0 ? Math.round((count / previousCount) * 100) : null;

            return (
              <div key={step.key} className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between text-small">
                  <span className="text-gray-700">{step.label}</span>
                  <span className="text-gray-500">
                    <span className="font-medium text-gray-900">{count}</span>
                    {conversionPct !== null && (
                      <span className="text-caption text-gray-400"> ({conversionPct}% of previous)</span>
                    )}
                  </span>
                </div>
                <div className="h-6 w-full overflow-hidden rounded-sm bg-gray-100">
                  <div
                    className={cn("h-full rounded-sm bg-primary-300", index === 0 && "bg-primary")}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

function ActivationFunnel({
  founder,
  investor,
}: {
  founder: FunnelStepCounts;
  investor: FunnelStepCounts;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ActivationFunnelCard title="Founder activation" counts={founder} steps={FOUNDER_STEPS} />
      <ActivationFunnelCard title="Investor activation" counts={investor} steps={INVESTOR_STEPS} />
    </div>
  );
}

export { ActivationFunnel };
