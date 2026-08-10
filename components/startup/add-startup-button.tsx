import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createDraftStartupAction } from "@/lib/startup/startup-actions";
import { cn } from "@/lib/utils";

/**
 * The "+ Add Startup" / "+ Create Startup" action, everywhere it appears
 * (My Startups header, and the empty state's larger CTA). A bare
 * `<form action={createDraftStartupAction}>` - no client component, no
 * onClick handler - works with zero JS, same pattern as the sign-out
 * button in the old founder header. Submitting it creates a blank draft
 * startup and lands the founder straight in the Sprint 3 edit flow for
 * it (see the createDraftStartupAction doc comment for why creation is
 * eager rather than happening on first save).
 */
function AddStartupButton({
  label = "Add Startup",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <form action={createDraftStartupAction} className={className}>
      <Button type="submit" className={cn(!className && "self-start")}>
        <Plus className="size-4" aria-hidden />
        {label}
      </Button>
    </form>
  );
}

export { AddStartupButton };
