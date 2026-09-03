"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type CompleteProductTourResult =
  { success: false; error: string } | { success: true };

/**
 * Marks the signed-in user's first-time product tour (Sprint 10) as
 * finished - fired by `ProductTour` (components/onboarding/product-tour.tsx)
 * on either "Skip" or the final step's "Get Started", which are the two
 * terminal actions per the brief ("After either Skip or Get Started, set
 * the onboarding as completed"). There's no third outcome to handle:
 * closing mid-way through any other means (Escape, backdrop click) is
 * routed to the same skip handler client-side, not a separate action.
 *
 * Scoped to `auth.uid()` via the existing "Users can update own profile"
 * RLS policy (Sprint 1 migration) - no new policy needed, same as every
 * other single-column profile update in this codebase (e.g.
 * `updateFounderProfileAction`'s `full_name` write).
 *
 * Idempotent by construction: re-running this against an
 * already-`true` row is a harmless no-op, which matters because the
 * tour's own client state (not this action) is what actually prevents
 * double-submission - see the "already completed" guard there.
 */
export async function completeProductTourAction(): Promise<CompleteProductTourResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You need to be signed in to do that." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ product_tour_completed: true })
    .eq("id", user.id);

  if (error) {
    return {
      success: false,
      error: "Couldn't save that. Please try again.",
    };
  }

  // Both landing pages the tour can appear on read `product_tour_completed`
  // server-side as part of the profile they already fetch - revalidate
  // both so a refresh (or the multi-device case from the brief) never
  // shows the tour again after this resolves.
  revalidatePath("/founder/startups");
  revalidatePath("/investor/discover");

  return { success: true };
}
