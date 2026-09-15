"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { setVerifiedAction } from "@/lib/admin/verification-actions";
import { formatRelativeDate } from "@/lib/format/date";
import type { AdminUserSummary } from "@/lib/queries/admin";

/**
 * Sprint 13 (Verified Badges). One row per user, each with its own
 * Verify/Unverify button - local `useState` per row (not one big list
 * refetch) so toggling one user doesn't need to wait on or re-render
 * every other row. `revalidatePath` in the action keeps a later full
 * page load correct regardless; this local state is just for the
 * immediate visual feedback on the row just clicked.
 */
function UsersList({ users: initialUsers }: { users: AdminUserSummary[] }) {
  const [users, setUsers] = useState(initialUsers);

  if (users.length === 0) {
    return (
      <Card className="items-center py-10 text-center text-small text-gray-500">
        No users found.
      </Card>
    );
  }

  function handleToggled(userId: string, verified: boolean) {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, verified } : u)));
  }

  return (
    <div className="flex flex-col gap-2">
      {users.map((user) => (
        <UserRow key={user.id} user={user} onToggled={handleToggled} />
      ))}
    </div>
  );
}

function UserRow({
  user,
  onToggled,
}: {
  user: AdminUserSummary;
  onToggled: (userId: string, verified: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const next = !user.verified;
    startTransition(async () => {
      const result = await setVerifiedAction(user.id, user.role, next);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      onToggled(user.id, next);
      toast.success(next ? "Marked as verified." : "Verification removed.");
    });
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-card bg-white p-4 shadow-subtle">
      <div className="flex min-w-0 items-center gap-2">
        <p className="truncate text-small font-medium text-gray-900">{user.fullName}</p>
        <VerifiedBadge verified={user.verified} />
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <p className="text-caption text-gray-500">{formatRelativeDate(user.createdAt)}</p>
        <Badge variant={user.role === "founder" ? "primary" : "secondary"}>
          {user.role === "founder" ? "Founder" : "Investor"}
        </Badge>
        <Button
          type="button"
          variant={user.verified ? "secondary" : "primary"}
          size="sm"
          onClick={handleClick}
          disabled={isPending}
        >
          {isPending ? "Saving\u2026" : user.verified ? "Unverify" : "Verify"}
        </Button>
      </div>
    </div>
  );
}

export { UsersList };
