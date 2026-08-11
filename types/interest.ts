import type { Database } from "@/types/database.types";
import type { InvestorType } from "@/types/profile";

export type InterestStatus = Database["public"]["Enums"]["interest_status"];
export type StartupInterestRow =
  Database["public"]["Tables"]["startup_interests"]["Row"];

/**
 * The startup fields shown alongside an interest, on both the Investor's
 * "My Interests" list and the Founder's "Interests" list - deliberately
 * a small slice of `StartupDetail`, not the whole thing, per the brief's
 * "My Interests" mockup ("Startup name, Startup logo, Interest status,
 * Date interest was submitted").
 */
export type InterestStartupSummary = {
  id: string;
  name: string | null;
  logoUrl: string | null;
  industry: string | null;
  stage: string | null;
};

/** One row in the Investor's "My Interests" list - see
 * `lib/queries/interests.ts`'s `getInvestorInterests`. */
export type InvestorInterestSummary = {
  id: string;
  status: InterestStatus;
  createdAt: string;
  respondedAt: string | null;
  startup: InterestStartupSummary;
};

/**
 * The investor-profile fields a Founder is allowed to see when reviewing
 * an interest - "Investor profile information already approved for
 * display" per the brief, i.e. the same fields already shown on the
 * investor's own profile view page. Never includes anything the RLS
 * policies in the Sprint 6 migration don't already scope to interested
 * founders only (see "Founders can read investor profiles for their
 * interests").
 */
export type InterestInvestorSummary = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  organization: string | null;
  investorType: InvestorType | null;
  country: string | null;
  bio: string | null;
  linkedinUrl: string | null;
};

/** One row in the Founder's "Interests" list - see
 * `lib/queries/interests.ts`'s `getFounderInterests`. */
export type FounderInterestSummary = {
  id: string;
  status: InterestStatus;
  createdAt: string;
  respondedAt: string | null;
  startup: InterestStartupSummary;
  investor: InterestInvestorSummary;
};
