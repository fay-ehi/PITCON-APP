"use server";

import { revalidatePath } from "next/cache";

import { checkAdminAccess } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/types/profile";

export type SetVerifiedResult = { success: false; error: string } | { success: true };

/**
 * Sets a founder's or investor's `verified` flag - the only way that
 * column can ever change (see migration 20260903090000's trigger,
 * which rejects the same write if it comes from the user's own RLS
 * session rather than this admin client).
 *
 * `checkAdminAccess()` re-runs the same allowlist check
 * app/admin/layout.tsx already does before rendering the page this is
 * called from - necessary here specifically because Server Actions are
 * independently invocable. A layout only gates *rendering* a page; it
 * does not, by itself, stop someone who has the action's reference
 * from calling it directly. Every other admin surface so far has been
 * read-only Server Components (recent signups, recent interests),
 * which had no such gap to begin with - this is the first admin
 * mutation, so it's the first place this check has needed to exist
 * inside the action itself, not just the page.
 */
export async function setVerifiedAction(
  userId: string,
  role: UserRole,
  verified: boolean,
): Promise<SetVerifiedResult> {
  const access = await checkAdminAccess();
  if (access.status !== "ok") {
    return { success: false, error: "Not authorized." };
  }

  const admin = createAdminClient();
  const table = role === "founder" ? "founder_profiles" : "investor_profiles";

  const { error } = await admin.from(table).update({ verified }).eq("id", userId);

  if (error) {
    return { success: false, error: "Couldn't update verification status. Please try again." };
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}
