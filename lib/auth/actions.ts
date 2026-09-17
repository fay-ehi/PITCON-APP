"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth";

/** Storage buckets scoped to `{founder_id}/{startup_id}/...` - same set
 * `deleteStartupAction` (lib/startup/startup-actions.ts) already cleans
 * up per-startup. Reused here so a founder's account deletion doesn't
 * leave every one of their startups' logo/cover/pitch-deck objects
 * behind. */
const FOUNDER_STARTUP_ASSET_BUCKETS = [
  "startup-logos",
  "startup-covers",
  "pitch-decks",
] as const;

/**
 * Signs the current user out and returns them to login. Bound directly to
 * a <form action={signOutAction}> so it works with zero client JS. No
 * need for a client component just to fire a click handler.
 */
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export type UpdateAccountPasswordResult =
  { success: false; error: string } | { success: true };

/**
 * Sets a new password from within the Founder Settings workspace
 * (Sprint 4's Account section). Reuses the same `resetPasswordSchema`
 * as the signed-out "forgot password" flow's `updatePasswordAction`
 * (app/(auth)/reset-password/actions.ts) - same password rules either
 * way - but deliberately does NOT sign the user out afterward: that flow
 * ends a one-time recovery-link session on purpose, whereas this one is
 * a founder mid-session changing their own password and should stay
 * signed in, same as any other settings save.
 */
export async function updateAccountPasswordAction(
  input: ResetPasswordInput,
): Promise<UpdateAccountPasswordResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Check the form and try again." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You need to be signed in to do that." };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, error: getAuthErrorMessage(error) };
  }

  return { success: true };
}

export type DeleteAccountResult =
  | { success: false; error: string }
  | { success: true; redirectTo: string };

/**
 * Permanently deletes the signed-in user's account - the Settings
 * workspace's "Delete account" control (Founder and Investor both route
 * here; the action itself is role-agnostic).
 *
 * Deleting the `auth.users` row via the admin API is what actually
 * matters for correctness: `profiles.id` references `auth.users (id) on
 * delete cascade` (Sprint 1 migration), and every table below that -
 * `founder_profiles`/`investor_profiles`, `startups`, `startup_interests`,
 * `conversations`, `messages`, `notifications`, `startup_shortlists`,
 * `reports`, `investor_industry_preferences`/`investor_stage_preferences`
 * - cascades from there in turn. One admin-API call removes the entire
 * account's data at the database level; nothing here re-implements that
 * by hand.
 *
 * What doesn't cascade automatically is Storage: avatar/logo/cover/pitch
 * -deck objects are just files in a bucket, not rows with a foreign key
 * to `profiles`. Cleaned up first, best-effort, same "don't block the
 * real deletion on a storage hiccup" reasoning as `deleteStartupAction`.
 * Must run before the account is deleted, not after - once the
 * `auth.users` row is gone, this session's RLS-scoped `supabase` client
 * can no longer authenticate to touch that user's storage objects, and
 * the request is over by then anyway.
 *
 * Uses `createAdminClient()` rather than the RLS-scoped `supabase`
 * client for the delete itself: removing an `auth.users` row (as
 * opposed to a `public` table row RLS can govern) is only possible
 * through the service-role admin API in the first place.
 *
 * Returns `redirectTo` rather than calling `redirect()` directly, same
 * reasoning as `updatePasswordAction` (app/(auth)/reset-password/
 * actions.ts) - this is invoked imperatively from the confirmation
 * dialog's onClick, not bound to a <form action={...}>.
 */
export async function deleteAccountAction(): Promise<DeleteAccountResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You need to be signed in to do that." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const { data: avatarFiles } = await supabase.storage
    .from("avatars")
    .list(user.id);
  if (avatarFiles && avatarFiles.length > 0) {
    await supabase.storage
      .from("avatars")
      .remove(avatarFiles.map((f) => `${user.id}/${f.name}`));
  }

  if (profile?.role === "founder") {
    const { data: startups } = await supabase
      .from("startups")
      .select("id")
      .eq("founder_id", user.id);

    for (const startup of startups ?? []) {
      const folder = `${user.id}/${startup.id}`;
      for (const bucket of FOUNDER_STARTUP_ASSET_BUCKETS) {
        const { data: files } = await supabase.storage
          .from(bucket)
          .list(folder);
        if (files && files.length > 0) {
          await supabase.storage
            .from(bucket)
            .remove(files.map((f) => `${folder}/${f.name}`));
        }
      }
    }
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    return {
      success: false,
      error: "Couldn't delete your account. Please try again.",
    };
  }

  // Best-effort: the account (and its session's underlying user) is
  // already gone at this point, so a failure here has nothing left to
  // clean up but the local cookies - not worth surfacing to the person
  // as an error on top of a delete that already succeeded.
  await supabase.auth.signOut().catch(() => {});

  return { success: true, redirectTo: "/login?accountDeleted=1" };
}
