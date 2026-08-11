"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { expressInterestAction } from "@/lib/interests/interest-actions";
import type { InterestStatus } from "@/types/interest";

/**
 * The Sprint 6 "Express Interest" action, rendered at the bottom of the
 * Discover preview panel - see the brief's "UI - INVESTOR DISCOVER" and
 * "CORE ACTION" sections. `initialStatus` comes from a server-side
 * lookup (`getOwnInterestForStartup`, loaded alongside the rest of the
 * preview's data in app/investor/discover/page.tsx), so the very first
 * paint already knows whether to show the CTA or the "Interest sent"
 * state - no loading flash, no client-only guess.
 *
 * Deliberately the only primary action here, per the brief's "Do not
 * create a second competing primary action" - once an interest exists
 * (in any status), the button is replaced entirely rather than
 * disabled-but-still-visible, so there's never a moment where clicking
 * again looks possible.
 */
function ExpressInterestButton({
  startupId,
  initialStatus,
}: {
  startupId: string;
  initialStatus: InterestStatus | null;
}) {
  const [status, setStatus] = useState<InterestStatus | null>(initialStatus);
  const [isPending, startTransition] = useTransition();

  if (status) {
    return (
      <div
        role="status"
        className="flex items-center gap-2.5 rounded-card border border-primary-100 bg-primary-50 px-4 py-3"
      >
        <CheckCircle2 className="size-5 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="text-small font-medium text-primary-700">Interest sent</p>
          <p className="text-caption text-primary-700/80">
            You have expressed interest in this startup.
          </p>
        </div>
      </div>
    );
  }

  function handleClick() {
    startTransition(async () => {
      const result = await expressInterestAction(startupId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setStatus("pending");
      toast.success("Interest sent.");
    });
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="w-full sm:w-auto"
    >
      {isPending ? "Sending\u2026" : "Express Interest"}
    </Button>
  );
}

export { ExpressInterestButton };
