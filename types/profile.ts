import type { Database } from "@/types/database.types";

/**
 * The two account types PITCON supports in the MVP. Sourced from the
 * generated `user_role` Postgres enum rather than redeclared by hand, so
 * this can never drift from the database constraint.
 */
export type UserRole = Database["public"]["Enums"]["user_role"];

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type InvestorType = Database["public"]["Enums"]["investor_type"];

export type FounderProfileRow =
  Database["public"]["Tables"]["founder_profiles"]["Row"];
export type InvestorProfileRow =
  Database["public"]["Tables"]["investor_profiles"]["Row"];

/** A single selectable industry or startup stage, as returned by
 * `lib/queries/profile.ts`. Both taxonomy tables share this shape. */
export type IndustryOption = {
  id: string;
  name: string;
  slug: string;
};
export type StageOption = IndustryOption;

/** The Founder profile fields shown on the profile view page and used as
 * edit-form defaults - `profiles.full_name`/`avatar_url` merged with
 * `founder_profiles`. */
export type FounderProfileDetail = {
  fullName: string;
  avatarUrl: string | null;
  jobTitle: string | null;
  country: string | null;
  bio: string | null;
  websiteUrl: string | null;
};

/** The Investor profile fields shown on the profile view page and used
 * as edit-form defaults - `profiles.full_name`/`avatar_url` merged with
 * `investor_profiles`, plus resolved industry/stage preferences. */
export type InvestorProfileDetail = {
  fullName: string;
  avatarUrl: string | null;
  organization: string | null;
  investorType: InvestorType | null;
  country: string | null;
  bio: string | null;
  linkedinUrl: string | null;
  fundingRangeMin: number | null;
  fundingRangeMax: number | null;
  industries: IndustryOption[];
  stages: StageOption[];
};
