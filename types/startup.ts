import type { Database } from "@/types/database.types";
import type { IndustryOption, StageOption } from "@/types/profile";

export type StartupStatus = Database["public"]["Enums"]["startup_status"];
export type StartupRow = Database["public"]["Tables"]["startups"]["Row"];

/**
 * The startup fields a Founder edits, in the shape the create/edit form
 * (`app/founder/startup/edit/startup-form.tsx`) reads and writes -
 * `null` for every field that's genuinely empty, camelCase, industry/
 * stage kept as bare IDs (the form owns resolving those to names via the
 * `industries`/`stages` option lists it's already loaded).
 *
 * Deliberately excludes `id`, `founderId`, `status`, `publishedAt`,
 * `createdAt`, `updatedAt` - those are server-owned, never something a
 * form payload sets directly (status changes only ever happen through
 * `publishStartupAction`, never as a side effect of a save).
 */
export type StartupFormFields = {
  name: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  tagline: string | null;
  description: string | null;
  industryId: string | null;
  stageId: string | null;
  country: string | null;
  city: string | null;
  websiteUrl: string | null;
  fundingAmountSought: number | null;
  annualRevenue: number | null;
  monthlyRevenue: number | null;
  customerCount: number | null;
  employeeCount: number | null;
  pitchDeckPath: string | null;
  pitchDeckOriginalName: string | null;
  elevatorPitch: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
};

/** The full startup as read back for the founder - form fields plus the
 * server-owned bits the view/preview page and dashboard need
 * (status, resolved industry/stage names for display, timestamps). */
export type StartupDetail = StartupFormFields & {
  id: string;
  status: StartupStatus;
  industry: IndustryOption | null;
  stage: StageOption | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Which of the publish-required fields (see the
 * `startups_publish_requires_completeness` DB constraint) are still
 * missing, keyed by form field name, for the "Ready to publish?" dialog
 * and the completion bar's hint text. Empty array = eligible to publish. */
export type StartupMissingField = keyof Pick<
  StartupFormFields,
  | "name"
  | "logoUrl"
  | "tagline"
  | "description"
  | "industryId"
  | "stageId"
  | "country"
  | "city"
  | "fundingAmountSought"
  | "customerCount"
  | "employeeCount"
  | "pitchDeckPath"
  | "elevatorPitch"
>;

export const STARTUP_MISSING_FIELD_LABELS: Record<StartupMissingField, string> = {
  name: "Startup name",
  logoUrl: "Logo",
  tagline: "Tagline",
  description: "Description",
  industryId: "Industry",
  stageId: "Stage",
  country: "Country",
  city: "City",
  fundingAmountSought: "Funding sought",
  customerCount: "Number of customers/users",
  employeeCount: "Number of employees",
  pitchDeckPath: "Pitch deck",
  elevatorPitch: "Elevator pitch",
};
