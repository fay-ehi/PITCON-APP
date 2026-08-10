import { Rocket } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { AddStartupButton } from "@/components/startup/add-startup-button";
import { cn } from "@/lib/utils";

/**
 * "No startups yet" empty state for the My Startups workspace (Sprint 4
 * brief's "NO STARTUPS STATE": no fake statistics, empty charts, fake
 * activity, or placeholder startup cards - just a deliberate onboarding
 * prompt). As of Sprint 4 this only ever renders on
 * `app/founder/startups/page.tsx` - the old founder-dashboard usage from
 * Sprint 3 no longer exists (that whole page is now the My Startups
 * workspace itself).
 */
function StartupEmptyState({ className }: { className?: string }) {
  return (
    <Card className={cn("items-center text-center", className)}>
      <CardContent className="flex flex-col items-center gap-4 py-12">
        <div className="rounded-pill bg-primary-50 flex size-14 items-center justify-center">
          <Rocket className="text-primary size-6" aria-hidden />
        </div>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-h3 font-semibold text-gray-900">
            Your first startup starts here.
          </h2>
          <p className="text-small max-w-sm text-gray-500">
            Create a startup profile and introduce what you&apos;re building to
            investors on PITCON.
          </p>
        </div>
        <AddStartupButton label="Create Startup" />
      </CardContent>
    </Card>
  );
}

export { StartupEmptyState };
