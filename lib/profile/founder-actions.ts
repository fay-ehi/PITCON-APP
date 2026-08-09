"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  founderProfileSchema,
  type FounderProfileInput,
} from "@/lib/validations/profile";

export type UpdateFounderProfileResult =
  | { success: false; error: string; field?: keyof FounderProfileInput }
  | { success: true };

/**
 * Updates the signed-in founder's profile. Touches two tables - the
 * shared `profiles.full_name` and the founder-specific columns added in
 * this sprint - since the edit form's "Personal Information" section
 * (Name, Photo, Country) spans both per the Sprint 2 brief's field
 * grouping. Not wrapped in a single RPC/transaction: both updates are
 * scoped to `auth.uid()` by RLS independently, and a partial failure
 * here (full_name saved, founder_profiles not, or vice versa) just means
 * the user sees an error and can resubmit - there's no intermediate
 * state that's unsafe to observe.
 *
 * Used by both the edit form (`app/founder/profile/edit`) and the
 * onboarding wizard (`app/founder/onboarding`) - the fields collected
 * are identical, onboarding is just this same update presented as a
 * first-run flow.
 */
export async function updateFounderProfileAction(
  input: FounderProfileInput,
): Promise<UpdateFounderProfileResult> {
  const parsed = founderProfileSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      success: false,
      error: issue?.message ?? "Check the form and try again.",
      field: issue?.path[0] as keyof FounderProfileInput | undefined,
    };
  }

  const { fullName, jobTitle, country, bio, websiteUrl } = parsed.data;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You need to be signed in to do that." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", user.id);

  if (profileError) {
    return {
      success: false,
      error: "Couldn't save your changes. Please try again.",
    };
  }

  const { error: founderError } = await supabase
    .from("founder_profiles")
    .update({
      job_title: jobTitle,
      country,
      bio: bio === "" ? null : bio,
      website_url: websiteUrl === "" ? null : websiteUrl,
    })
    .eq("id", user.id);

  if (founderError) {
    return {
      success: false,
      error: "Couldn't save your changes. Please try again.",
    };
  }

  revalidatePath("/founder/profile");
  revalidatePath("/founder");

  return { success: true };
}
