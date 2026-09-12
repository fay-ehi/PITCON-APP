import { createClient } from "@/lib/supabase/server";

/**
 * Admin access, added in the pre-launch hardening pass. Deliberately
 * the simplest thing that works: a comma-separated allowlist of email
 * addresses in `ADMIN_EMAILS` (see .env.example), checked against the
 * signed-in session's own email - no new `is_admin` column, no new
 * role, no separate admin login. That's a reasonable trade for a
 * platform with a handful of trusted operators; revisit if that ever
 * stops being true (a real `admin` role with its own RLS policies is
 * the natural next step, not a rewrite of this file's call sites).
 *
 * Reads `user.email` from the session directly rather than looking
 * anything up in `public.profiles` - email lives only on
 * `auth.users`, and `supabase.auth.getUser()` already returns it for
 * the signed-in user's own session without needing the admin client.
 */
function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

export type AdminSession = { userId: string; email: string };

export type AdminAccessResult =
  | { status: "signed_out" }
  | { status: "forbidden" }
  | { status: "ok"; session: AdminSession };

/**
 * The single auth check `/admin` runs - one `supabase.auth.getUser()`
 * call, distinguishing "not signed in at all" from "signed in but not
 * on the allowlist" so `app/admin/layout.tsx` can send each case
 * somewhere different (login vs. a plain 404 - see that file's own
 * comment on why).
 */
export async function checkAdminAccess(): Promise<AdminAccessResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { status: "signed_out" };
  if (!isAdminEmail(user.email)) return { status: "forbidden" };

  return { status: "ok", session: { userId: user.id, email: user.email! } };
}
