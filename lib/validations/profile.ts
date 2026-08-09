import { z } from "zod";

import { isValidCountry } from "@/constants/countries";
import { INVESTOR_TYPES } from "@/constants/investor-types";

const INVESTOR_PREFERENCES_MAX_INDUSTRIES = 20;
const INVESTOR_PREFERENCES_MAX_STAGES = 10;

/**
 * Shared by both Founder and Investor forms. Not a `z.enum(COUNTRIES)`
 * because zod's enum overloads want a literal tuple type and `COUNTRIES`
 * is a plain `readonly string[]` re-used at runtime for the picker - a
 * `.refine()` against the same array does the same validation without
 * fighting the types.
 */
export const countrySchema = z
  .string()
  .trim()
  .min(1, "Select your country.")
  // Explicit `: boolean` return annotation matters here: TS 5.5+ infers
  // type predicates automatically for functions whose body is a direct
  // `return someTypeGuard(x)`, even through this kind of wrapper arrow
  // function - without the annotation, the inferred predicate leaks
  // through `.refine()` and narrows this schema's output to the full
  // `Country` literal union instead of `string`, which then breaks
  // zodResolver's Resolver type in the edit forms.
  .refine((value): boolean => isValidCountry(value), {
    error: "Select a valid country from the list.",
  });

/** Empty string or a well-formed http(s) URL. Every optional link field
 * (Founder's website/LinkedIn/portfolio, Investor's LinkedIn) uses this. */
const optionalUrlSchema = z.union([
  z.literal(""),
  z.url("Enter a valid link starting with http:// or https://."),
]);

const bioSchema = z
  .string()
  .trim()
  .max(500, "Keep your bio to 500 characters or less.");

// ----------------------------------------------------------------------------
// Founder profile
// ----------------------------------------------------------------------------

export const founderProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(100, "Full name is too long."),
  jobTitle: z
    .string()
    .trim()
    .min(2, "Enter your job title.")
    .max(100, "Job title is too long."),
  country: countrySchema,
  bio: bioSchema,
  websiteUrl: optionalUrlSchema,
});

export type FounderProfileInput = z.infer<typeof founderProfileSchema>;

// ----------------------------------------------------------------------------
// Investor profile
// ----------------------------------------------------------------------------

const investorTypeValues = INVESTOR_TYPES.map((t) => t.value) as [
  (typeof INVESTOR_TYPES)[number]["value"],
  ...(typeof INVESTOR_TYPES)[number]["value"][],
];

export const investorTypeSchema = z.enum(investorTypeValues, {
  error: "Select an investor type.",
});

export const investorProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(100, "Full name is too long."),
  organization: z
    .string()
    .trim()
    .min(2, "Enter your organization.")
    .max(150, "Organization name is too long."),
  country: countrySchema,
  investorType: investorTypeSchema,
  bio: bioSchema,
  linkedinUrl: optionalUrlSchema,
});

export type InvestorProfileInput = z.infer<typeof investorProfileSchema>;

// ----------------------------------------------------------------------------
// Investor preferences (industries, stages, funding range)
// ----------------------------------------------------------------------------

const optionalAmountSchema = z
  .number()
  .refine((value) => Number.isFinite(value) && value >= 0, {
    error: "Enter a valid amount.",
  })
  .nullable();

/**
 * Validates the *final* payload sent to `updateInvestorPreferencesAction`
 * - i.e. after the form has already turned its raw `<input>` strings into
 * `number | null` via `parseAmountInput` below. Kept as a plain
 * number-in/number-out schema (no `.transform()`) so client and server
 * can share one schema/type without RHF's resolver having to reconcile
 * separate input vs. output shapes for a form that's otherwise just chip
 * toggles and two number fields.
 */
export const investorPreferencesSchema = z
  .object({
    industryIds: z
      .array(z.uuid())
      .max(
        INVESTOR_PREFERENCES_MAX_INDUSTRIES,
        "Select at most 20 industries.",
      ),
    stageIds: z
      .array(z.uuid())
      .max(INVESTOR_PREFERENCES_MAX_STAGES, "Select at most 10 stages."),
    fundingRangeMin: optionalAmountSchema,
    fundingRangeMax: optionalAmountSchema,
  })
  .refine(
    (data) =>
      data.fundingRangeMin === null ||
      data.fundingRangeMax === null ||
      data.fundingRangeMax >= data.fundingRangeMin,
    {
      error: "Maximum must be greater than or equal to minimum.",
      path: ["fundingRangeMax"],
    },
  );

export type InvestorPreferencesInput = z.infer<
  typeof investorPreferencesSchema
>;

/** Converts a raw `<input type="number">` string (possibly empty) into
 * `number | null`, or an error message if it's not a valid non-negative
 * amount. Used by the preferences form before it builds the payload
 * above - kept as a plain function rather than folded into the zod
 * schema so the form can validate-as-you-type without fighting a
 * transform's input/output type split. */
export function parseAmountInput(
  raw: string,
):
  | { value: number | null; error?: undefined }
  | { value?: undefined; error: string } {
  const trimmed = raw.trim();
  if (trimmed === "") return { value: null };

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return { error: "Enter a valid amount." };
  }
  return { value: parsed };
}
