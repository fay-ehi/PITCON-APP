"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { STARTUP_MISSING_FIELD_LABELS, type StartupMissingField } from "@/types/startup";

/**
 * "Ready to publish?" confirmation, per the Sprint 3 brief's section 9 -
 * communicates that the startup becomes discoverable once published.
 * When fields are still missing, shows the checklist instead of a
 * confirm action, so the founder knows exactly what's blocking them
 * without a wasted round trip to the server (the actual gate is
 * server-side either way - see `publishStartupAction`).
 */
function PublishDialog({
  open,
  onOpenChange,
  missingFields,
  isPublishing,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missingFields: StartupMissingField[];
  isPublishing: boolean;
  onConfirm: () => void;
}) {
  const isReady = missingFields.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isReady ? "Ready to publish?" : "A few things are missing"}
          </DialogTitle>
          <DialogDescription>
            {isReady
              ? "Once published, your startup can appear in investor discovery."
              : "Finish these fields before your startup can be published:"}
          </DialogDescription>
        </DialogHeader>

        {!isReady && (
          <ul className="text-small flex flex-col gap-1.5 text-gray-700">
            {missingFields.map((field) => (
              <li key={field} className="flex items-center gap-2">
                <span className="bg-destructive size-1.5 shrink-0 rounded-full" />
                {STARTUP_MISSING_FIELD_LABELS[field]}
              </li>
            ))}
          </ul>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            {isReady ? "Cancel" : "Keep editing"}
          </Button>
          {isReady && (
            <Button type="button" onClick={onConfirm} disabled={isPublishing}>
              {isPublishing ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden />
                  Publishing...
                </>
              ) : (
                "Publish startup"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { PublishDialog };
