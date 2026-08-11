import { z } from "zod";

/**
 * Kept in sync with `messages_content_max_length` in the Sprint 7
 * migration - if either changes, update both. Also reused by
 * `MessageComposer`'s `maxLength` and remaining-character logic, so the
 * form and the database agree on the same number rather than the form
 * guessing at one.
 */
export const MESSAGE_MAX_LENGTH = 4000;

/**
 * "MESSAGE VALIDATION": reject empty and whitespace-only messages, cap a
 * reasonable maximum length. `.trim()` before the length checks is what
 * makes "whitespace-only" actually rejected rather than merely
 * discouraged - a message of only spaces trims to an empty string and
 * fails `.min(1)` the same as a genuinely empty one.
 */
export const messageContentSchema = z
  .string()
  .trim()
  .min(1, "Write a message before sending.")
  .max(
    MESSAGE_MAX_LENGTH,
    `Messages can't be longer than ${MESSAGE_MAX_LENGTH} characters.`,
  );
