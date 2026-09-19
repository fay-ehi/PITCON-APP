"use client";

import { useFormStatus } from "react-dom";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createDraftStartupAction } from "@/lib/startup/startup-actions";
import { cn } from "@/lib/utils";

/**
 * The "+ Add Startup" / "+ Create Startup" action, everywhere it appears
 * (My Startups header, and the empty state's larger CTA). Still a bare
 * `<form action={createDraftStartupAction}>` - no onClick handler, no
 * client state of its own - works with zero JS exactly as before.
 * `AddStartupSubmitButton` below is the one piece that needs to be a
 * client component, and only for `useFormStatus()` - the pending state
 * it reads comes from this form's own submission, not anything this
 * file manages.
 *
 * That pending state matters here specifically because
 * `createDraftStartupAction` isn't instant: it's a real DB insert
 * followed by a redirect into the edit flow (see that action's doc
 * comment), so with no visual feedback the button could look like it
 * hadn't registered the click - and unlike most of this app's
 * navigation, submitting this form again before the first submission
 * lands doesn't just repeat a fetch, it creates a *second* blank draft
 * startup. `disabled` on the pending button is what actually prevents
 * that; the spinner is just what tells the founder why nothing's
 * happening yet, same `Loader2 animate-spin` convention as
 * `discover-preview-dialog.tsx`'s "Opening…".
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
      <AddStartupSubmitButton label={label} className={!className ? "self-start" : undefined} />
    </form>
  );
}

function AddStartupSubmitButton({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className={cn(className)}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Creating&hellip;
        </>
      ) : (
        <>
          <Plus className="size-4" aria-hidden />
          {label}
        </>
      )}
    </Button>
  );
}

export { AddStartupButton };
