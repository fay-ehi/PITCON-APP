"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  COVER_MAX_SIZE_BYTES,
  COVER_MAX_SIZE_LABEL,
  LOGO_MAX_SIZE_BYTES,
  LOGO_MAX_SIZE_LABEL,
  extensionForImageMimeType,
  isAllowedImageMimeType,
} from "@/lib/startup/asset-constraints";

export type StartupAssetActionResult =
  { success: false; error: string } | { success: true; url: string | null };

type AssetKind = "logo" | "cover";

const BUCKET: Record<AssetKind, string> = {
  logo: "startup-logos",
  cover: "startup-covers",
};

function revalidateStartupPaths(startupId: string) {
  revalidatePath("/founder/startups");
  revalidatePath(`/founder/startups/${startupId}`);
  revalidatePath(`/founder/startups/${startupId}/edit`);
}

/**
 * Shared upload/remove implementation for the startup logo and cover
 * image - same public-bucket, replace-on-upload pattern as
 * `lib/profile/avatar-actions.ts`'s avatar handling, just parameterized
 * over which of the two assets is being touched. Kept as one internal
 * helper (rather than duplicating the whole flow twice) since the only
 * real difference between the two is which bucket/column/size-limit
 * applies - `uploadStartupLogoAction` / `uploadStartupCoverAction` below
 * are thin, differently-validated wrappers around it.
 *
 * As of Sprint 4 (many startups per founder), every object lives under
 * `{founder_id}/{startup_id}/{file}` rather than Sprint 3's
 * `{founder_id}/{file}` - the extra path segment is what keeps two
 * startups belonging to the same founder from ever overwriting each
 * other's logo/cover in the same bucket. `startupId` is required for
 * every call; ownership is re-checked on the database update below
 * (`.eq("id", startupId).eq("founder_id", user.id)`), not assumed from
 * the storage path alone.
 */
async function uploadAsset(
  kind: AssetKind,
  startupId: string,
  file: File,
): Promise<StartupAssetActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You need to be signed in to do that." };
  }

  const bucket = BUCKET[kind];
  const folder = `${user.id}/${startupId}`;

  const { data: existingFiles } = await supabase.storage
    .from(bucket)
    .list(folder);

  if (existingFiles && existingFiles.length > 0) {
    await supabase.storage
      .from(bucket)
      .remove(existingFiles.map((f) => `${folder}/${f.name}`));
  }

  const extension = extensionForImageMimeType(
    file.type as Parameters<typeof extensionForImageMimeType>[0],
  );
  const path = `${folder}/${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return {
      success: false,
      error: "Couldn't upload that image. Please try again.",
    };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  // Supabase's generated `update()` types reject a generic
  // `{ [computedKey]: value }` object (it can't tell that COLUMN[kind]
  // narrows to a real column name at this point) - an explicit branch
  // keeps the payload a literal object type instead.
  const updatePayload =
    kind === "logo" ? { logo_url: publicUrl } : { cover_image_url: publicUrl };

  const { data, error: updateError } = await supabase
    .from("startups")
    .update(updatePayload)
    .eq("id", startupId)
    .eq("founder_id", user.id)
    .select("id")
    .single();

  if (updateError || !data) {
    // Best-effort: don't leave an orphaned object behind for a save that
    // didn't actually take (wrong/missing startupId, RLS mismatch, etc).
    await supabase.storage.from(bucket).remove([path]);
    return {
      success: false,
      error: "Couldn't save your changes. Please try again.",
    };
  }

  revalidateStartupPaths(startupId);

  return { success: true, url: publicUrl };
}

async function removeAsset(
  kind: AssetKind,
  startupId: string,
): Promise<StartupAssetActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You need to be signed in to do that." };
  }

  const bucket = BUCKET[kind];
  const folder = `${user.id}/${startupId}`;

  const { data: existingFiles } = await supabase.storage
    .from(bucket)
    .list(folder);

  if (existingFiles && existingFiles.length > 0) {
    await supabase.storage
      .from(bucket)
      .remove(existingFiles.map((f) => `${folder}/${f.name}`));
  }

  const updatePayload =
    kind === "logo" ? { logo_url: null } : { cover_image_url: null };

  const { data, error: updateError } = await supabase
    .from("startups")
    .update(updatePayload)
    .eq("id", startupId)
    .eq("founder_id", user.id)
    .select("id")
    .single();

  if (updateError || !data) {
    return {
      success: false,
      error: "Couldn't remove that image. Please try again.",
    };
  }

  revalidateStartupPaths(startupId);

  return { success: true, url: null };
}

export async function uploadStartupLogoAction(
  startupId: string,
  formData: FormData,
): Promise<StartupAssetActionResult> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { success: false, error: "No image was provided." };
  }
  if (!isAllowedImageMimeType(file.type)) {
    return {
      success: false,
      error: "Please choose a PNG, JPEG, or WEBP image.",
    };
  }
  if (file.size > LOGO_MAX_SIZE_BYTES) {
    return {
      success: false,
      error: `That image is too large. Please choose one under ${LOGO_MAX_SIZE_LABEL}.`,
    };
  }
  return uploadAsset("logo", startupId, file);
}

export async function removeStartupLogoAction(
  startupId: string,
): Promise<StartupAssetActionResult> {
  return removeAsset("logo", startupId);
}

export async function uploadStartupCoverAction(
  startupId: string,
  formData: FormData,
): Promise<StartupAssetActionResult> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { success: false, error: "No image was provided." };
  }
  if (!isAllowedImageMimeType(file.type)) {
    return {
      success: false,
      error: "Please choose a PNG, JPEG, or WEBP image.",
    };
  }
  if (file.size > COVER_MAX_SIZE_BYTES) {
    return {
      success: false,
      error: `That image is too large. Please choose one under ${COVER_MAX_SIZE_LABEL}.`,
    };
  }
  return uploadAsset("cover", startupId, file);
}

export async function removeStartupCoverAction(
  startupId: string,
): Promise<StartupAssetActionResult> {
  return removeAsset("cover", startupId);
}
