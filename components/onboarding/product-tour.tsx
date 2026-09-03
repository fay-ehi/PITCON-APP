"use client";

import { useRef, useState, useTransition } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { completeProductTourAction } from "@/lib/onboarding/tour-actions";
import type { TourStep } from "@/components/onboarding/tour-steps";

/**
 * The Sprint 10 first-time product tour: the real application renders
 * underneath (this component adds nothing but an overlay + floating
 * card - it never replaces the page), the background dims but stays
 * recognizable, and the user moves through `steps` with
 * Back/Next/Skip, finishing with "Get Started" on the last one.
 *
 * Deliberately built on `DialogPrimitive` directly rather than the
 * shared `components/ui/dialog.tsx` wrapper - that wrapper's overlay/
 * content are tuned for ordinary confirm/edit dialogs (centered,
 * `max-w-lg`, always a close "X"), and this needs its own sizing,
 * bottom-sheet-on-mobile layout, and no redundant close button (Skip
 * is the one documented exit, per the brief's "visually secondary to
 * Next" - Escape and a backdrop click both still work, routed through
 * the same skip path, for keyboard/pointer users who reach for those
 * instead). Radix still supplies what actually matters here for free:
 * focus trapping, `role="dialog"`/`aria-modal`, and restoring focus to
 * whatever launched it on close.
 *
 * Only ever mounted when the tour is genuinely incomplete - see
 * `FounderProductTour`/`InvestorProductTour`, which gate rendering this
 * at all on `initiallyCompleted`. That means `open` here can safely
 * default to `true`: there is no "closed" resting state for this
 * component to represent, only "showing" (`open`) vs. "just
 * dismissed" (`open` flips to `false` once, then this un-mounts on the
 * next navigation/refresh because the server-side flag has caught up).
 */
function ProductTour({
  steps,
  ariaLabel,
}: {
  steps: TourStep[];
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isPending, startTransition] = useTransition();
  const persisted = useRef(false);

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;
  const step = steps[stepIndex];

  function persistCompletion() {
    if (persisted.current) return;
    persisted.current = true;

    startTransition(async () => {
      const result = await completeProductTourAction();
      if (!result.success) {
        // The card is already closed at this point (see `dismiss`) - a
        // failed write here shouldn't trap the user in the tour to
        // retry it. `product_tour_completed` simply stays false
        // server-side, so the next time this page loads the tour
        // mounts again naturally - no separate retry path needed.
        toast.error(result.error);
      }
    });
  }

  /** Shared by Skip and the final step's "Get Started" - per the
   * brief, both are terminal and both persist completion the same way. */
  function dismiss() {
    setOpen(false);
    persistCompletion();
  }

  function handleOpenChange(next: boolean) {
    // Radix reports Escape and backdrop clicks the same way a
    // controlled close would - treat both as Skip rather than leaving
    // the tour in a half-dismissed state assistive tech or keyboard
    // users could get stuck in.
    if (!next) dismiss();
  }

  function goNext() {
    if (isLast) {
      dismiss();
      return;
    }
    setDirection(1);
    setStepIndex((current) => current + 1);
  }

  function goBack() {
    if (isFirst) return;
    setDirection(-1);
    setStepIndex((current) => current - 1);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
    } else if (event.key === "ArrowLeft" && !isFirst) {
      event.preventDefault();
      goBack();
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            // Dim, but the brief is explicit the app underneath must
            // stay recognizable - 45% black is enough to establish
            // focus on the card without hiding the workspace behind it.
            "fixed inset-0 z-50 bg-gray-900/45",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "motion-reduce:!animate-none",
          )}
        />
        <DialogPrimitive.Content
          aria-label={ariaLabel}
          onKeyDown={handleKeyDown}
          onOpenAutoFocus={(event) => {
            // Land focus on the card itself rather than Radix's default
            // "first focusable element" (Back/Skip button on later
            // steps) - a screen reader user then hears the heading
            // before any control.
            event.preventDefault();
            (event.currentTarget as HTMLElement).focus();
          }}
          tabIndex={-1}
          className={cn(
            "rounded-t-marketing border-border shadow-strong fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] w-full flex-col overflow-hidden border-t bg-white outline-none",
            "sm:rounded-marketing sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:max-h-[85vh] sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:border",
            "data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:slide-out-to-bottom-6 data-[state=open]:slide-in-from-bottom-6 sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95",
            "motion-reduce:!animate-none",
          )}
        >
          {/* Announces step changes to screen readers while the dialog
              stays open - the visible Title/Description below update
              per step too, but text changing inside an already-open
              dialog isn't reliably re-announced on its own. */}
          <p aria-live="polite" className="sr-only">
            Step {stepIndex + 1} of {steps.length}: {step.heading}
          </p>

          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            <div
              key={step.id}
              className={cn(
                "flex flex-col items-center text-center",
                "animate-in fade-in duration-300 motion-reduce:animate-none",
                direction === 1
                  ? "slide-in-from-right-3"
                  : "slide-in-from-left-3",
              )}
            >
              <div className="from-primary-50 rounded-marketing relative mb-5 flex h-40 w-full shrink-0 items-center justify-center overflow-hidden bg-gradient-to-b to-white sm:h-48">
                {step.visual}
              </div>

              <DialogPrimitive.Title className="text-h3 font-semibold text-gray-900">
                {step.heading}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-small mt-2 max-w-sm text-gray-500">
                {step.body}
              </DialogPrimitive.Description>
            </div>
          </div>

          <div className="border-border shrink-0 border-t px-6 py-4 sm:px-8">
            <div
              aria-hidden="true"
              className="mb-4 flex items-center justify-center gap-1.5"
            >
              {steps.map((s, index) => (
                <span
                  key={s.id}
                  className={cn(
                    "rounded-pill h-1.5 transition-all",
                    index === stepIndex
                      ? "bg-primary-500 w-5"
                      : "w-1.5 bg-gray-200",
                  )}
                />
              ))}
            </div>

            <div className="flex items-center justify-between gap-3">
              {!isFirst ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={goBack}
                >
                  <ArrowLeft aria-hidden /> Back
                </Button>
              ) : (
                <span aria-hidden />
              )}

              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={dismiss}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Skip
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={goNext}
                  disabled={isPending && isLast}
                >
                  {isLast ? "Get Started" : "Next"}
                  {!isLast && <ArrowRight aria-hidden />}
                </Button>
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export { ProductTour };
