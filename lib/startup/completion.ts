import type { StartupFormFields, StartupMissingField } from "@/types/startup";

/**
 * The exact set of fields the planning document's "Create Startup"
 * feature spec lists as required (i.e. everything it does NOT tag
 * "(optional)" or list under its "Optional:" Socials heading). This is
 * the one place that set is defined - `getMissingPublishFields` (used
 * by `publishStartupAction` to decide whether publishing is even
 * attempted) and `calculateStartupCompletion` (the completion bar) both
 * read from it, so the completion bar's "100%" and "eligible to
 * publish" can never drift apart. The database's
 * `startups_publish_requires_completeness` constraint is the same list,
 * kept in sync by hand (see the comment there).
 *
 * Deliberately excludes: website, annual revenue, monthly revenue,
 * cover image, and all three social links - all explicitly optional
 * per the planning document.
 */
const REQUIRED_FIELDS: StartupMissingField[] = [
  "name",
  "logoUrl",
  "tagline",
  "description",
  "industryId",
  "stageId",
  "country",
  "city",
  "fundingAmountSought",
  "customerCount",
  "employeeCount",
  "pitchDeckPath",
  "elevatorPitch",
];

function isFilled(value: StartupFormFields[StartupMissingField]): boolean {
  if (value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true; // numbers: 0 is a genuinely filled-in value (e.g. "0 employees")
}

/** Which required fields are still missing, in a stable order matching
 * the form's own section order - used for the "Ready to publish?"
 * dialog's checklist and to block the Publish button before a wasted
 * round trip to the server (the database constraint is still what
 * actually enforces this either way). */
export function getMissingPublishFields(
  fields: StartupFormFields,
): StartupMissingField[] {
  return REQUIRED_FIELDS.filter((field) => !isFilled(fields[field]));
}

export function isStartupPublishReady(fields: StartupFormFields): boolean {
  return getMissingPublishFields(fields).length === 0;
}

/** 0-100. Based solely on the required-for-publish fields (see the
 * module comment) - per the Sprint 3 brief, "Do not artificially
 * inflate completion by counting every optional field." A startup at
 * 100% here is, by construction, exactly a startup that can publish. */
export function calculateStartupCompletion(fields: StartupFormFields): number {
  const filledCount = REQUIRED_FIELDS.filter((field) =>
    isFilled(fields[field]),
  ).length;
  return Math.round((filledCount / REQUIRED_FIELDS.length) * 100);
}
