"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteAccountAction } from "@/lib/auth/actions";

const CONFIRM_PHRASE = "DELETE";

/**
 * Founder Settings' "Delete account" control - a separate Danger zone
 * card from Account actions (the sign-out card) so an irreversible
 * action doesn't sit one click away from a routine one.
 * A direct copy of app/investor/settings/delete-account-section.tsx:
 * `deleteAccountAction` (lib/auth/actions.ts) is already role-agnostic,
 * but page-local duplication is the established pattern for Settings
 * pieces in this codebase (see settings-password-form.tsx's own note),
 * so this follows suit rather than introducing a components/shared/ file
 * for what's otherwise a one-page control.
 *
 * Requires typing DELETE before the destructive button enables - the
 * existing "Delete startup" confirmation (components/startup/
 * startup-card.tsx) doesn't need this since a startup is scoped to one
 * founder's own data, but this action cascades every startup, message,
 * interest, and notification tied to the account, so the extra
 * deliberate step is worth the friction here specifically.
 */
function DeleteAccountSection() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [confirmText, setConfirmText] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);

  const canConfirm = confirmText === CONFIRM_PHRASE;

  function handleOpenChange(next: boolean) {
    if (isDeleting) return;
    setOpen(next);
    if (!next) setConfirmText("");
  }

  async function handleDelete() {
    if (!canConfirm) return;
    setIsDeleting(true);
    try {
      const result = await deleteAccountAction();
      if (!result.success) {
        setIsDeleting(false);
        toast.error(result.error);
        return;
      }
      // Keep the button in its loading state through the navigation
      // itself, rather than flashing back to the dialog for a moment.
      router.push(result.redirectTo);
    } catch {
      setIsDeleting(false);
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <>
      <div className="flex flex-col items-start gap-3">
        <p className="text-small text-gray-500">
          Permanently delete your account, your startups, and all related
          messages, interests, and notifications. This can&apos;t be undone.
        </p>
        <Button
          type="button"
          variant="destructive"
          onClick={() => setOpen(true)}
        >
          Delete account
        </Button>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This permanently deletes your profile, every startup you&apos;ve
              added, and all related messages, investor interests, and
              notifications. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="delete-confirm">
              Type <span className="font-semibold">DELETE</span> to confirm
            </Label>
            <Input
              id="delete-confirm"
              autoComplete="off"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={isDeleting}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleOpenChange(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={!canConfirm || isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { DeleteAccountSection };
