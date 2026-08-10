import { z } from "zod";

import { isValidCountry } from "@/constants/countries";

/**
 * Validates the startup create/edit form's *save* payload - i.e. after
 * the form has normalized raw `<input>` strings ("" for an empty field)
 * into `string | null` / `number | null` via the parse helpers below.
 * Mirrors `lib/validations/profile.ts`'s approach for the same reason:
 * client and server share one schema/type without RHF's resolver having
 * to reconcile a separate input vs. output shape.
 *
 * This intentionally validates *format only* - every field here is
 * `.nullable()`, because per the Sprint 3 brief a draft can be saved at
 * any level of completeness ("Do not require the entire startup profile
 * to be complete before a draft can be saved"). Which fields are
 * *required to publish* is a separate question, answered by
 * `lib/startup/completion.ts` (used both for the completion bar and to
 * gate `publishStartupAction`) and enforced for real by the
 * `startups_publish_requires_completeness` database constraint - this
 * schema has no opinion on publish-readiness.
 */

const nullableText = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, `${label} needs at least ${min} characters.`)
    .max(max, `${label} can be at most ${max} characters or fewer.`)
    .nullable();

const nullableLongText = (max: number, label: string) =>
  z.string().max(max, `${label} can be at most ${max} characters.`).nullable();

const nullableUrl = (label: string) =>
  z
    .union([z.null(), z.url(`Enter a valid ${label} starting with http:// or https://.`)])
    .nullable();

/** Wrapped so its own declared return type is plain `boolean`, not
 * `isValidCountry`'s `value is Country` guard - Zod v4's `.refine()`
 * narrows its output type when the predicate calls a type-guard function
 * directly (confirmed empirically; even through `value === null ||
 * isValidCountry(value)`), which would make `nullableCountry` infer as
 * the full `Country` literal union instead of `string | null` - wrong,
 * since this schema validates a plain form-submitted string, not
 * something already known to be a `Country`. */
function isCountryValid(value: string): boolean {
  return isValidCountry(value);
}

const nullableCountry = z
  .string()
  .nullable()
  .refine((value) => value === null || isCountryValid(value), {
    error: "Select a valid country from the list.",
  });

const nullableNonNegativeAmount = z
  .number()
  .refine((value) => Number.isFinite(value) && value >= 0, {
    error: "Enter a valid amount.",
  })
  .nullable();

const nullableNonNegativeInteger = z
  .number()
  .refine((value) => Number.isInteger(value) && value >= 0, {
    error: "Enter a whole number, zero or greater.",
  })
  .nullable();

export const startupSaveSchema = z.object({
  name: nullableText(2, 100, "Startup name"),
  tagline: nullableText(2, 150, "Tagline"),
  description: nullableLongText(2000, "Description"),
  industryId: z.uuid().nullable(),
  stageId: z.uuid().nullable(),
  country: nullableCountry,
  city: nullableText(2, 100, "City"),
  websiteUrl: nullableUrl("website link"),
  fundingAmountSought: nullableNonNegativeAmount,
  annualRevenue: nullableNonNegativeAmount,
  monthlyRevenue: nullableNonNegativeAmount,
  customerCount: nullableNonNegativeInteger,
  employeeCount: nullableNonNegativeInteger,
  elevatorPitch: nullableLongText(600, "Elevator pitch"),
  linkedinUrl: nullableUrl("LinkedIn link"),
  twitterUrl: nullableUrl("X (Twitter) link"),
  instagramUrl: nullableUrl("Instagram link"),
});

export type StartupSaveInput = z.infer<typeof startupSaveSchema>;

/** Converts a raw `<input type="number">` string (possibly empty) into
 * `number | null`, or an error message - same contract as
 * `parseAmountInput` in lib/validations/profile.ts, reused here rather
 * than imported from there since this one also supports an
 * integer-only mode for customer/employee counts. */
export function parseStartupNumberInput(
  raw: string,
  options: { integer?: boolean } = {},
):
  | { value: number | null; error?: undefined }
  | { value?: undefined; error: string } {
  const trimmed = raw.trim();
  if (trimmed === "") return { value: null };

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return { error: "Enter a valid amount." };
  }
  if (options.integer && !Number.isInteger(parsed)) {
    return { error: "Enter a whole number." };
  }
  return { value: parsed };
}

/** "" -> null, otherwise trims. Used to normalize every plain text
 * `<input>`/`<textarea>` before it's handed to `startupSaveSchema`. */
export function parseStartupTextInput(raw: string): string | null {
  const trimmed = raw.trim();
  return trimmed === "" ? null : trimmed;
}
