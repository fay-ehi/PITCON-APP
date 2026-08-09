"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  AVATAR_MAX_SIZE_BYTES,
  extensionForMimeType,
  isAllowedAvatarMimeType,
} from "@/lib/profile/avatar-constraints";

export type AvatarActionResult =
  | { success: false; error: string }
  | { success: true; avatarUrl: string | null };

/**
 * Uploads a new avatar to the `avatars` Storage bucket and points
 * `profiles.avatar_url` at it. Shared by the Founder and Investor
 * edit/onboarding forms - avatar lives on the shared `profiles` table,
 * see the Sprint 2 migration.
 *
 * Objects are stored at `{user_id}/{timestamp}.{ext}`. The user's own
 * previous avatar files are removed first so the bucket doesn't
 * accumulate orphaned uploads every time someone changes their photo.
 *
 * Re-validates type/size server-side even though the client already
 * checked (`components/profile/avatar-upload.tsx`) - the client check is
 * for instant feedback, this is the actual boundary. The `avatars`
 * bucket's own `file_size_limit`/`allowed_mime_types` (set in the
 * migration) is a second backstop below this one.
 */
export async function uploadAvatarAction(
  formData: FormData,
): Promise<AvatarActionResult> {
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { success: false, error: "No image was provided." };
  }

  if (!isAllowedAvatarMimeType(file.type)) {
    return {
      success: false,
      error: "Please choose a PNG, JPEG, or WEBP image.",
    };
  }

  if (file.size > AVATAR_MAX_SIZE_BYTES) {
    return {
      success: false,
      error: "That image is too large. Please choose one under 5MB.",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You need to be signed in to do that." };
  }

  // Best-effort cleanup of the previous avatar(s). Not fatal if this
  // fails (e.g. first-ever upload, nothing to remove) - we still proceed
  // to upload the new one.
  const { data: existingFiles } = await supabase.storage
    .from("avatars")
    .list(user.id);

  if (existingFiles && existingFiles.length > 0) {
    await supabase.storage
      .from("avatars")
      .remove(existingFiles.map((f) => `${user.id}/${f.name}`));
  }

  const extension = extensionForMimeType(file.type);
  const path = `${user.id}/${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return {
      success: false,
      error: "Couldn't upload that image. Please try again.",
    };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (updateError) {
    return {
      success: false,
      error: "Couldn't save your new photo. Please try again.",
    };
  }

  revalidatePath("/founder/profile");
  revalidatePath("/investor/profile");

  return { success: true, avatarUrl: publicUrl };
}

/** Removes the current avatar entirely (storage object + `avatar_url`). */
export async function removeAvatarAction(): Promise<AvatarActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You need to be signed in to do that." };
  }

  const { data: existingFiles } = await supabase.storage
    .from("avatars")
    .list(user.id);

  if (existingFiles && existingFiles.length > 0) {
    await supabase.storage
      .from("avatars")
      .remove(existingFiles.map((f) => `${user.id}/${f.name}`));
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", user.id);

  if (updateError) {
    return {
      success: false,
      error: "Couldn't remove your photo. Please try again.",
    };
  }

  revalidatePath("/founder/profile");
  revalidatePath("/investor/profile");

  return { success: true, avatarUrl: null };
}
