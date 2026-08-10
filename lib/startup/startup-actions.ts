"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getMissingPublishFields } from "@/lib/startup/completion";
import {
  startupSaveSchema,
  type StartupSaveInput,
} from "@/lib/validations/startup";
import {
  STARTUP_MISSING_FIELD_LABELS,
  type StartupMissingField,
} from "@/types/startup";

export type SaveStartupResult =
  | { success: false; error: string; field?: keyof StartupSaveInput }
  | { success: true };

export type PublishStartupResult =
  | { success: false; error: string; missingFields: StartupMissingField[] }
  | { success: true };

export type DeleteStartupResult =
  { success: false; error: string } | { success: true };

/** Postgres's SQLSTATE for a CHECK constraint violation - specifically
 * `startups_publish_requires_completeness` here (the Sprint 3 migration).
 * Reachable if a founder edits an already-*published* startup and clears
 * a required field: per the brief, that edit shouldn't silently revert
 * the startup to draft, so the database rejects the update outright and
 * this becomes a friendly "you can't remove that while published"
 * message instead of a generic save failure. */
const POSTGRES_CHECK_VIOLATION = "23514";

function revalidateStartupPaths(startupId: string) {
  revalidatePath("/founder/startups");
  revalidatePath(`/founder/startups/${startupId}`);
  revalidatePath(`/founder/startups/${startupId}/edit`);
}

/**
 * Creates a new, entirely blank draft startup for the signed-in founder
 * and sends them straight into the Sprint 3 edit flow for it - the same
 * flow used to edit any other startup, per the Sprint 4 brief's "the
 * existing flow must work for Startup A, Startup B, Startup C...; do not
 * create a second startup creation system."
 *
 * Bound directly to the "+ Add Startup" / "+ Create Startup"
 * `<form action={...}>` (same zero-argument, works-without-JS pattern as
 * `signOutAction` in lib/auth/actions.ts). Creating the row up front -
 * rather than lazily on first save/asset-upload, which is how Sprint 3
 * originally worked when a founder could only ever have one startup - is
 * what makes every other startup action (`saveStartupAction`,
 * `publishStartupAction`, the asset actions) a plain "update the row I
 * already know the id of" instead of an upsert that has to guess which
 * startup a founder with several drafts currently means.
 */
export async function createDraftStartupAction(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/founder/startups");
  }

  const { data, error } = await supabase
    .from("startups")
    .insert({ founder_id: user.id })
    .select("id")
    .single();

  if (error || !data) {
    // Nothing sensible to show inline from a bare <form action> - land
    // back on My Startups, where the list itself makes clear nothing new
    // was created. A failure here is rare: this insert has no
    // user-supplied fields that could be rejected.
    redirect("/founder/startups");
  }

  revalidatePath("/founder/startups");
  redirect(`/founder/startups/${data.id}/edit`);
}

/**
 * Updates one startup, identified by id - called on every "Save Draft"
 * and as the first step of publishing. Unlike Sprint 3's original
 * version, this is never a row-creating upsert: `createDraftStartupAction`
 * above is now the only place a startup row is ever created, so by the
 * time a founder can reach the edit form the row already exists and this
 * is a plain, ownership-scoped update.
 */
export async function saveStartupAction(
  startupId: string,
  input: StartupSaveInput,
): Promise<SaveStartupResult> {
  const parsed = startupSaveSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      success: false,
      error: issue?.message ?? "Check the form and try again.",
      field: issue?.path[0] as keyof StartupSaveInput | undefined,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You need to be signed in to do that." };
  }

  const d = parsed.data;
  const { data, error } = await supabase
    .from("startups")
    .update({
      name: d.name,
      tagline: d.tagline,
      description: d.description,
      industry_id: d.industryId,
      stage_id: d.stageId,
      country: d.country,
      city: d.city,
      website_url: d.websiteUrl,
      funding_amount_sought: d.fundingAmountSought,
      annual_revenue: d.annualRevenue,
      monthly_revenue: d.monthlyRevenue,
      customer_count: d.customerCount,
      employee_count: d.employeeCount,
      elevator_pitch: d.elevatorPitch,
      linkedin_url: d.linkedinUrl,
      twitter_url: d.twitterUrl,
      instagram_url: d.instagramUrl,
    })
    .eq("id", startupId)
    .eq("founder_id", user.id)
    .select("id")
    .single();

  if (error) {
    if (error.code === POSTGRES_CHECK_VIOLATION) {
      return {
        success: false,
        error:
          "This startup is published, so that field can't be left empty. Fill it back in, or contact support if you need to unpublish.",
      };
    }
    return {
      success: false,
      error: "Couldn't save your changes. Please try again.",
    };
  }
  if (!data) {
    return { success: false, error: "Couldn't find that startup." };
  }

  revalidateStartupPaths(startupId);

  return { success: true };
}

/**
 * Publishes one startup, identified by id. Re-validates against the row
 * currently in the database (not whatever the client last submitted) -
 * per the Sprint 3 brief, "A founder should not be able to bypass
 * required fields by manually calling an endpoint or modifying a
 * request." The `startups_publish_requires_completeness` database
 * constraint is the real backstop either way (see the Sprint 3
 * migration); this check exists so a founder who's missing a field gets
 * a specific, actionable list back instead of a raw constraint-violation
 * error. The `founder_id` filter on both the fetch and the update means a
 * founder can never publish - or even discover the field-completeness of
 * - a startup that isn't theirs.
 */
export async function publishStartupAction(
  startupId: string,
): Promise<PublishStartupResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "You need to be signed in to do that.",
      missingFields: [],
    };
  }

  const { data: row, error: fetchError } = await supabase
    .from("startups")
    .select("*")
    .eq("id", startupId)
    .eq("founder_id", user.id)
    .single();

  if (fetchError || !row) {
    return {
      success: false,
      error: "Couldn't find that startup.",
      missingFields: [],
    };
  }

  const missingFields = getMissingPublishFields({
    name: row.name,
    logoUrl: row.logo_url,
    coverImageUrl: row.cover_image_url,
    tagline: row.tagline,
    description: row.description,
    industryId: row.industry_id,
    stageId: row.stage_id,
    country: row.country,
    city: row.city,
    websiteUrl: row.website_url,
    fundingAmountSought: row.funding_amount_sought,
    annualRevenue: row.annual_revenue,
    monthlyRevenue: row.monthly_revenue,
    customerCount: row.customer_count,
    employeeCount: row.employee_count,
    pitchDeckPath: row.pitch_deck_path,
    pitchDeckOriginalName: row.pitch_deck_original_name,
    elevatorPitch: row.elevator_pitch,
    linkedinUrl: row.linkedin_url,
    twitterUrl: row.twitter_url,
    instagramUrl: row.instagram_url,
  });

  if (missingFields.length > 0) {
    const labels = missingFields.map((f) => STARTUP_MISSING_FIELD_LABELS[f]);
    return {
      success: false,
      error: `Finish these fields before publishing: ${labels.join(", ")}.`,
      missingFields,
    };
  }

  const { error: publishError } = await supabase
    .from("startups")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", startupId)
    .eq("founder_id", user.id);

  if (publishError) {
    return {
      success: false,
      error: "Couldn't publish your startup. Please try again.",
      missingFields: [],
    };
  }

  revalidateStartupPaths(startupId);

  return { success: true };
}

/**
 * Deletes one startup, identified by id - the overflow-menu "Delete"
 * action on the My Startups grid (Sprint 4 brief's "provide an overflow
 * menu for secondary actions"). Best-effort cleans up that startup's own
 * storage objects first: logo/cover/pitch-deck files live under
 * `{founder_id}/{startup_id}/...` (see the Sprint 4 storage-path update
 * in asset-actions.ts / pitch-deck-actions.ts), scoped per startup so
 * this can never touch another startup's files. A storage cleanup
 * failure isn't fatal - the row delete below (which cascades RLS-safe,
 * `founder_id`-scoped either way) is what actually matters for
 * correctness; an orphaned object in a private/founder-scoped bucket is
 * a cheap tradeoff against blocking deletion entirely on a storage
 * hiccup.
 */
export async function deleteStartupAction(
  startupId: string,
): Promise<DeleteStartupResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You need to be signed in to do that." };
  }

  const folder = `${user.id}/${startupId}`;
  for (const bucket of [
    "startup-logos",
    "startup-covers",
    "pitch-decks",
  ] as const) {
    const { data: files } = await supabase.storage.from(bucket).list(folder);
    if (files && files.length > 0) {
      await supabase.storage
        .from(bucket)
        .remove(files.map((f) => `${folder}/${f.name}`));
    }
  }

  const { error } = await supabase
    .from("startups")
    .delete()
    .eq("id", startupId)
    .eq("founder_id", user.id);

  if (error) {
    return {
      success: false,
      error: "Couldn't delete that startup. Please try again.",
    };
  }

  revalidatePath("/founder/startups");

  return { success: true };
}
