/**
 * Upload constraints for startup assets, shared by the client-side
 * file pickers (`components/startup/*-upload.tsx`) and the server
 * actions that re-validate on the way in (`lib/startup/asset-actions.ts`,
 * `lib/startup/pitch-deck-actions.ts`).
 *
 * Kept in sync with the `startup-logos` / `startup-covers` / `pitch-decks`
 * Storage buckets' `file_size_limit` / `allowed_mime_types` in
 * `supabase/migrations/20260809080000_startups.sql` - if either changes,
 * update both. The bucket config is Supabase's own backstop; these
 * constants are what let the UI reject a bad file immediately instead of
 * waiting on an upload round trip to fail.
 */

export const LOGO_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const LOGO_MAX_SIZE_LABEL = "5MB";

export const COVER_MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
export const COVER_MAX_SIZE_LABEL = "8MB";

export const PITCH_DECK_MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB
export const PITCH_DECK_MAX_SIZE_LABEL = "20MB";

export const IMAGE_ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export type ImageMimeType = (typeof IMAGE_ALLOWED_MIME_TYPES)[number];

const MIME_TO_EXTENSION: Record<ImageMimeType, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export function isAllowedImageMimeType(type: string): type is ImageMimeType {
  return (IMAGE_ALLOWED_MIME_TYPES as readonly string[]).includes(type);
}

export function extensionForImageMimeType(type: ImageMimeType): string {
  return MIME_TO_EXTENSION[type];
}

/** Validates a logo file before it's sent to the server. Mirrors the
 * checks `lib/startup/asset-actions.ts` performs again server-side. */
export function validateLogoFile(file: File): string | null {
  if (!isAllowedImageMimeType(file.type)) {
    return "Please choose a PNG, JPEG, or WEBP image.";
  }
  if (file.size > LOGO_MAX_SIZE_BYTES) {
    return `That image is too large. Please choose one under ${LOGO_MAX_SIZE_LABEL}.`;
  }
  return null;
}

/** Validates a cover image file before it's sent to the server. Mirrors
 * the checks `lib/startup/asset-actions.ts` performs again server-side. */
export function validateCoverFile(file: File): string | null {
  if (!isAllowedImageMimeType(file.type)) {
    return "Please choose a PNG, JPEG, or WEBP image.";
  }
  if (file.size > COVER_MAX_SIZE_BYTES) {
    return `That image is too large. Please choose one under ${COVER_MAX_SIZE_LABEL}.`;
  }
  return null;
}

/** Validates a pitch deck file before it's sent to the server. Mirrors
 * the checks `lib/startup/pitch-deck-actions.ts` performs again
 * server-side. */
export function validatePitchDeckFile(file: File): string | null {
  if (file.type !== "application/pdf") {
    return "Please choose a PDF file.";
  }
  if (file.size > PITCH_DECK_MAX_SIZE_BYTES) {
    return `That file is too large. Please choose one under ${PITCH_DECK_MAX_SIZE_LABEL}.`;
  }
  return null;
}
