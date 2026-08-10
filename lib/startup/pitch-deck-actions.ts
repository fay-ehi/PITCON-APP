"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  PITCH_DECK_MAX_SIZE_BYTES,
  PITCH_DECK_MAX_SIZE_LABEL,
} from "@/lib/startup/asset-constraints";

export type PitchDeckActionResult =
  | { success: false; error: string }
  | { success: true; path: string | null; originalName: string | null };

const BUCKET = "pitch-decks";

function revalidateStartupPaths(startupId: string) {
  revalidatePath("/founder/startups");
  revalidatePath(`/founder/startups/${startupId}`);
  revalidatePath(`/founder/startups/${startupId}/edit`);
}

/**
 * Uploads one startup's pitch deck to the private `pitch-decks` bucket
 * and records both the storage path and the original filename (shown in
 * the UI as e.g. "Acme-deck.pdf" instead of the opaque
 * `{timestamp}.pdf` the file is actually stored as).
 *
 * As of Sprint 4, objects live under `{founder_id}/{startup_id}/{file}`
 * rather than Sprint 3's `{founder_id}/{file}` - required now that a
 * founder can have several startups each with their own deck.
 * `startupId` is required for every call; the database update below
 * re-checks `founder_id` ownership rather than trusting the path alone.
 *
 * Unlike the logo/cover actions, this never calls `getPublicUrl()` -
 * the bucket isn't public (see the Sprint 3 migration's rationale: the
 * planning document explicitly defers the pitch-deck access rule to a
 * later sprint). `pitch_deck_path` is a storage object path only;
 * viewing it always goes through `getPitchDeckSignedUrl()`
 * (`lib/queries/startup.ts`), generated fresh on every view rather than
 * stored, so access can't outlive the founder's own session.
 */
export async function uploadPitchDeckAction(
  startupId: string,
  formData: FormData,
): Promise<PitchDeckActionResult> {
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { success: false, error: "No file was provided." };
  }
  if (file.type !== "application/pdf") {
    return { success: false, error: "Please choose a PDF file." };
  }
  if (file.size > PITCH_DECK_MAX_SIZE_BYTES) {
    return {
      success: false,
      error: `That file is too large. Please choose one under ${PITCH_DECK_MAX_SIZE_LABEL}.`,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You need to be signed in to do that." };
  }

  const folder = `${user.id}/${startupId}`;

  // Best-effort cleanup of the previous deck - not fatal if it fails.
  const { data: existingFiles } = await supabase.storage
    .from(BUCKET)
    .list(folder);

  if (existingFiles && existingFiles.length > 0) {
    await supabase.storage
      .from(BUCKET)
      .remove(existingFiles.map((f) => `${folder}/${f.name}`));
  }

  const path = `${folder}/${Date.now()}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: "application/pdf", upsert: false });

  if (uploadError) {
    return {
      success: false,
      error: "Couldn't upload that file. Please try again.",
    };
  }

  const { data, error: updateError } = await supabase
    .from("startups")
    .update({
      pitch_deck_path: path,
      pitch_deck_original_name: file.name.slice(0, 255),
    })
    .eq("id", startupId)
    .eq("founder_id", user.id)
    .select("id")
    .single();

  if (updateError || !data) {
    await supabase.storage.from(BUCKET).remove([path]);
    return {
      success: false,
      error: "Couldn't save your changes. Please try again.",
    };
  }

  revalidateStartupPaths(startupId);

  return { success: true, path, originalName: file.name };
}

export async function removePitchDeckAction(
  startupId: string,
): Promise<PitchDeckActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You need to be signed in to do that." };
  }

  const folder = `${user.id}/${startupId}`;

  const { data: existingFiles } = await supabase.storage
    .from(BUCKET)
    .list(folder);

  if (existingFiles && existingFiles.length > 0) {
    await supabase.storage
      .from(BUCKET)
      .remove(existingFiles.map((f) => `${folder}/${f.name}`));
  }

  const { data, error: updateError } = await supabase
    .from("startups")
    .update({ pitch_deck_path: null, pitch_deck_original_name: null })
    .eq("id", startupId)
    .eq("founder_id", user.id)
    .select("id")
    .single();

  if (updateError || !data) {
    if (updateError?.code === "23514") {
      return {
        success: false,
        error:
          "This startup is published and requires a pitch deck. Upload a replacement before removing this one.",
      };
    }
    return {
      success: false,
      error: "Couldn't remove that file. Please try again.",
    };
  }

  revalidateStartupPaths(startupId);

  return { success: true, path: null, originalName: null };
}
