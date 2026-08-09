"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  investorPreferencesSchema,
  investorProfileSchema,
  type InvestorPreferencesInput,
  type InvestorProfileInput,
} from "@/lib/validations/profile";

export type UpdateInvestorProfileResult =
  | { success: false; error: string; field?: keyof InvestorProfileInput }
  | { success: true };

/**
 * Updates the signed-in investor's profile. Touches `profiles.full_name`
 * plus the investor-specific columns, same rationale as
 * `updateFounderProfileAction`. Used by both the edit form and the
 * onboarding wizard.
 */
export async function updateInvestorProfileAction(
  input: InvestorProfileInput,
): Promise<UpdateInvestorProfileResult> {
  const parsed = investorProfileSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      success: false,
      error: issue?.message ?? "Check the form and try again.",
      field: issue?.path[0] as keyof InvestorProfileInput | undefined,
    };
  }

  const { fullName, organization, country, investorType, bio, linkedinUrl } =
    parsed.data;
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

  const { error: investorError } = await supabase
    .from("investor_profiles")
    .update({
      organization,
      country,
      investor_type: investorType,
      bio: bio === "" ? null : bio,
      linkedin_url: linkedinUrl === "" ? null : linkedinUrl,
    })
    .eq("id", user.id);

  if (investorError) {
    return {
      success: false,
      error: "Couldn't save your changes. Please try again.",
    };
  }

  revalidatePath("/investor/profile");
  revalidatePath("/investor");

  return { success: true };
}

export type UpdateInvestorPreferencesResult =
  { success: false; error: string } | { success: true };

/**
 * Replaces the signed-in investor's industry/stage preferences and
 * updates their funding range. The industry/stage swap goes through the
 * `replace_investor_preferences` RPC (see the Sprint 2 migration) so it
 * happens atomically instead of as two client-visible delete+insert
 * round trips; the funding range is a plain column update alongside it.
 */
export async function updateInvestorPreferencesAction(
  input: InvestorPreferencesInput,
): Promise<UpdateInvestorPreferencesResult> {
  const parsed = investorPreferencesSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      success: false,
      error: issue?.message ?? "Check the form and try again.",
    };
  }

  const { industryIds, stageIds, fundingRangeMin, fundingRangeMax } =
    parsed.data;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You need to be signed in to do that." };
  }

  const { error: rangeError } = await supabase
    .from("investor_profiles")
    .update({
      funding_range_min: fundingRangeMin,
      funding_range_max: fundingRangeMax,
    })
    .eq("id", user.id);

  if (rangeError) {
    return {
      success: false,
      error: "Couldn't save your funding range. Please try again.",
    };
  }

  const { error: prefsError } = await supabase.rpc(
    "replace_investor_preferences",
    { p_industry_ids: industryIds, p_stage_ids: stageIds },
  );

  if (prefsError) {
    return {
      success: false,
      error: "Couldn't save your preferences. Please try again.",
    };
  }

  revalidatePath("/investor/profile");
  revalidatePath("/investor");

  return { success: true };
}
