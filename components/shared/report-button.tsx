"use client";

import { useState, useTransition } from "react";
import { Flag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { submitReportAction } from "@/lib/reports/report-actions";
import { REPORT_REASON_LABELS } from "@/types/report";
import type { ReportReason } from "@/types/report";
import { cn } from "@/lib/utils";

/**
 * Sprint 15. A small, deliberately unobtrusive "Report" trigger + its
 * dialog, reusable everywhere a founder or investor might need to flag
 * someone - Discover (a startup/founder, before ever messaging), My
 * Interests (an investor), and a conversation thread (whoever's on the
 * other end). Subtle by design (a plain icon-button, gray, not a red
 * warning color) - this should be discoverable, not something that
 * makes every profile look like it's under suspicion by default.
 */
function ReportButton({
  reportedUserId,
  label,
  startupId,
  conversationId,
  className,
}: {
  /** The person being reported, when the caller already knows their
   * real id (My Interests, a conversation thread). Omit when reporting
   * from Discover, where only `startupId` is known - the server
   * resolves the founder's id itself, see report-actions.ts. */
  reportedUserId?: string;
  /** e.g. "Report this startup", "Report this investor" - shown as the
   * dialog's title. */
  label: string;
  startupId?: string;
  conversationId?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | "">("");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      // Reset once the dialog fully closes, not while it's still
      // visible mid-close-animation - avoids the form visibly
      // clearing itself before the dialog is gone.
      setTimeout(() => {
        setReason("");
        setDetails("");
        setSubmitted(false);
      }, 200);
    }
  }

  function handleSubmit() {
    if (!reason) return;
    startTransition(async () => {
      const result = await submitReportAction(reason, details, {
        reportedUserId,
        startupId,
        conversationId,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setSubmitted(true);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1 text-caption text-gray-400 hover:text-gray-600 hover:underline",
          className,
        )}
      >
        <Flag className="size-3" aria-hidden />
        Report
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          {submitted ? (
            <>
              <DialogHeader>
                <DialogTitle>Report submitted</DialogTitle>
                <DialogDescription>
                  Thanks for letting us know. Our team will review this.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="button" onClick={() => handleOpenChange(false)}>
                  Done
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{label}</DialogTitle>
                <DialogDescription>
                  This is reported privately to the PITCON team - the person you&apos;re
                  reporting won&apos;t be notified.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label htmlFor="report-reason">Reason</Label>
                  <Select
                    value={reason || undefined}
                    onValueChange={(value) => setReason(value as ReportReason)}
                  >
                    <SelectTrigger id="report-reason" aria-label="Reason">
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(REPORT_REASON_LABELS).map(([value, text]) => (
                        <SelectItem key={value} value={value}>
                          {text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report-details">Details (optional)</Label>
                  <Textarea
                    id="report-details"
                    rows={4}
                    maxLength={1000}
                    value={details}
                    onChange={(event) => setDetails(event.target.value)}
                    placeholder="Anything that would help us understand what happened."
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSubmit} disabled={!reason || isPending}>
                  {isPending ? "Submitting\u2026" : "Submit report"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export { ReportButton };
