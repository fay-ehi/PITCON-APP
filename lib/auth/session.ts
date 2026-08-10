import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types/profile";

/**
 * The signed-in user's auth identity plus their application profile
 * (full name + role), or `null` if there is no signed-in user.
 *
 * Always calls `auth.getUser()` rather than `auth.getSession()`, per
 * Supabase's guidance, `getUser()` revalidates the token against the Auth
 * server on every call, while a session decoded straight from cookies
 * could be stale or tampered with. This is what makes route protection
 * here actually server-enforced rather than trusting client state.
 */
export async function getCurrentUserProfile(): Promise<{
  userId: string;
  email: string | undefined;
  profile: Profile;
} | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Should never happen in practice: `handle_new_user()` creates the
  // profile row atomically with the auth account, but a user mid-way
  // through account deletion, or a race on a brand new signup, are
  // reasons a profile could momentarily be missing. Treat as signed out
  // rather than crashing the page.
  if (!profile) return null;

  return { userId: user.id, email: user.email, profile };
}

/** Where a signed-in user of a given role should land. As of Sprint 4,
 * a founder's home is the My Startups workspace - `/founder` itself is
 * kept alive only as a redirect to here (see app/founder/page.tsx), for
 * old links/bookmarks. As of Sprint 5, an investor's home is the
 * Discover workspace, for the same reason - see app/investor/page.tsx. */
export function roleHomePath(role: UserRole): string {
  return role === "founder" ? "/founder/startups" : "/investor/discover";
}
