"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { setVerifiedAction } from "@/lib/admin/verification-actions";
import type { UserRole } from "@/types/profile";

/**
 * Sprint 18 (Public Profile Pages). The same `setVerifiedAction` and
 * local-state-then-`revalidatePath` pattern `UsersList`'s `UserRow`
 * already uses on `/admin/users` - pulled out into its own component
 * rather than reused directly, since that one owns a whole list's
 * worth of local state (`users`, `onToggled`) this single-user detail
 * page has no need for.
 */
function VerifyToggleButton({
  userId,
  role,
  initialVerified,
}: {
  userId: string;
  role: UserRole;
  initialVerified: boolean;
}) {
  const [verified, setVerified] = useState(initialVerified);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const next = !verified;
    startTransition(async () => {
      const result = await setVerifiedAction(userId, role, next);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setVerified(next);
      toast.success(next ? "Marked as verified." : "Verification removed.");
    });
  }

  return (
    <Button
      type="button"
      variant={verified ? "secondary" : "primary"}
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? "Saving\u2026" : verified ? "Unverify" : "Verify"}
    </Button>
  );
}

export { VerifyToggleButton };
