/**
 * Avatar upload constraints, shared by the client-side file picker
 * (`components/profile/avatar-upload.tsx`) and the server action that
 * re-validates on the way in (`lib/profile/avatar-actions.ts`).
 *
 * Kept in sync with the `avatars` Storage bucket's `file_size_limit` /
 * `allowed_mime_types` in
 * `supabase/migrations/20260808130000_founder_investor_profile_details.sql`
 * - if either changes, update both. The bucket config is Supabase's own
 * backstop; these constants are what let the UI reject a bad file
 * immediately instead of waiting on an upload round trip to fail.
 */
export const AVATAR_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const AVATAR_MAX_SIZE_LABEL = "5MB";

export const AVATAR_ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export type AvatarMimeType = (typeof AVATAR_ALLOWED_MIME_TYPES)[number];

const MIME_TO_EXTENSION: Record<AvatarMimeType, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export function isAllowedAvatarMimeType(type: string): type is AvatarMimeType {
  return (AVATAR_ALLOWED_MIME_TYPES as readonly string[]).includes(type);
}

/** Validates a File before it's ever sent to the server. Mirrors the
 * checks `lib/profile/avatar-actions.ts` performs again server-side. */
export function validateAvatarFile(file: File): string | null {
  if (!isAllowedAvatarMimeType(file.type)) {
    return "Please choose a PNG, JPEG, or WEBP image.";
  }
  if (file.size > AVATAR_MAX_SIZE_BYTES) {
    return `That image is too large. Please choose one under ${AVATAR_MAX_SIZE_LABEL}.`;
  }
  return null;
}

export function extensionForMimeType(type: AvatarMimeType): string {
  return MIME_TO_EXTENSION[type];
}
