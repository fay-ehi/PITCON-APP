"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProfileField } from "@/components/profile/profile-field";
import { InterestStatusBadge } from "@/components/shared/interest-status-badge";
import { investorTypeLabel } from "@/constants/investor-types";
import { formatRelativeDate } from "@/lib/format/date";
import { respondToInterestAction } from "@/lib/interests/interest-actions";
import type { FounderInterestSummary } from "@/types/interest";

/**
 * The Founder's review experience for one Interest - the brief's
 * "FOUNDER REVIEW EXPERIENCE": which startup, the investor's
 * approved-for-display profile fields, current status, and Accept/
 * Decline. Declining goes through a second confirm step
 * (`confirmDeclineOpen`) - the same nested-Dialog pattern as
 * StartupCard's delete confirmation - since the brief specifically
 * calls out declining as something that "could reasonably be
 * accidental"; accepting doesn't get the same extra step.
 *
 * Both actions stay available regardless of the interest's current
 * status (not just while pending) - the database allows a founder to
 * move between accepted/declined freely (see
 * protect_startup_interest_update() in the Sprint 6 migration), so a
 * founder who accepted by mistake isn't stuck.
 */
function InterestDetailDialog({
  interest,
  open,
  onOpenChange,
}: {
  interest: FounderInterestSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [confirmDeclineOpen, setConfirmDeclineOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const initial = interest.investor.fullName.trim().slice(0, 1).toUpperCase() || "I";
  const typeLabel = investorTypeLabel(interest.investor.investorType);
  const startupName = interest.startup.name || "your startup";

  function respond(decision: "accepted" | "declined") {
    startTransition(async () => {
      const result = await respondToInterestAction(interest.id, decision);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setConfirmDeclineOpen(false);
      onOpenChange(false);
      toast.success(decision === "accepted" ? "Interest accepted." : "Interest declined.");
      router.refresh();
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarImage src={interest.investor.avatarUrl ?? undefined} alt="" />
                <AvatarFallback>{initial}</AvatarFallback>
              </Avatar>
              {interest.investor.fullName}
            </DialogTitle>
            <DialogDescription>
              Interested in <span className="font-medium text-gray-700">{startupName}</span>
              {" \u00b7 "}Submitted {formatRelativeDate(interest.createdAt)}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between">
            <InterestStatusBadge status={interest.status} />
            {interest.respondedAt && (
              <span className="text-caption text-gray-500">
                Updated {formatRelativeDate(interest.respondedAt)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <ProfileField label="Organization" value={interest.investor.organization} />
            <ProfileField label="Investor type" value={typeLabel} />
            <ProfileField label="Country" value={interest.investor.country} />
            <ProfileField
              label="LinkedIn"
              value={
                interest.investor.linkedinUrl ? (
                  <a
                    href={interest.investor.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary inline-flex items-center gap-1 hover:underline"
                  >
                    View profile
                    <ExternalLink className="size-3" aria-hidden />
                  </a>
                ) : null
              }
            />
          </div>
          <ProfileField label="Bio" value={interest.investor.bio} />

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setConfirmDeclineOpen(true)}
              disabled={isPending}
            >
              Decline
            </Button>
            <Button type="button" onClick={() => respond("accepted")} disabled={isPending}>
              {isPending ? "Saving\u2026" : "Accept"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDeclineOpen} onOpenChange={setConfirmDeclineOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline this interest?</DialogTitle>
            <DialogDescription>
              {interest.investor.fullName} will see that their interest in {startupName} was
              declined.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setConfirmDeclineOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => respond("declined")}
              disabled={isPending}
            >
              {isPending ? "Declining\u2026" : "Decline interest"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { InterestDetailDialog };
