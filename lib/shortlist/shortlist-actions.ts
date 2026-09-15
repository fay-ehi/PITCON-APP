"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

/** Postgres's code for a unique-constraint violation - specifically
 * `startup_shortlists_investor_startup_key` here (the Sprint 12
 * migration). Same reasoning as `expressInterestAction`'s handling of
 * this code: a double-click or a slow-network retry landing twice
 * shouldn't surface as an error when the end state the investor wants
 * (this startup is shortlisted) is already true either way. */
const POSTGRES_UNIQUE_VIOLATION = "23505";

export type ShortlistActionResult =
  | { success: false; error: string }
  | { success: true };

/**
 * Adds one published startup to the signed-in investor's shortlist.
 * Mirrors `expressInterestAction`'s shape closely - the
 * `status = 'published'` check here is a friendly-error mirror of the
 * Sprint 12 migration's INSERT policy `with check`, RLS is the real
 * backstop either way.
 */
export async function addToShortlistAction(
  startupId: string,
): Promise<ShortlistActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You need to be signed in to do that." };
  }

  const { error } = await supabase
    .from("startup_shortlists")
    .insert({ startup_id: startupId, investor_id: user.id });

  if (error && error.code !== POSTGRES_UNIQUE_VIOLATION) {
    return {
      success: false,
      error: "Couldn't add this startup to your shortlist. Please try again.",
    };
  }

  // The Discover grid/dialog both update their own local state
  // optimistically from this action's return value (see
  // shortlist-button.tsx) - this only matters for a second tab or a
  // later visit to My Shortlist.
  revalidatePath("/investor/discover");
  revalidatePath("/investor/shortlist");

  return { success: true };
}

/**
 * Removes one startup from the signed-in investor's shortlist. Unlike
 * `startup_interests`, shortlisting has no "duplicate protection"
 * concern in the other direction either: deleting a row that's already
 * gone (a double-click, or removing it from two open tabs) is treated
 * as success rather than an error - the end state the investor wants
 * (not shortlisted) is already true.
 */
export async function removeFromShortlistAction(
  startupId: string,
): Promise<ShortlistActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You need to be signed in to do that." };
  }

  const { error } = await supabase
    .from("startup_shortlists")
    .delete()
    .eq("startup_id", startupId)
    .eq("investor_id", user.id);

  if (error) {
    return {
      success: false,
      error: "Couldn't remove this startup from your shortlist. Please try again.",
    };
  }

  revalidatePath("/investor/discover");
  revalidatePath("/investor/shortlist");

  return { success: true };
}
