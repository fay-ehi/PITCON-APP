/**
 * Simple profile-completion percentage, used on the profile view page and
 * (once a profile is incomplete) as a nudge on the dashboard placeholder.
 * Deliberately not an "analytics system" - just a count of filled-in
 * required fields out of the total, per the Sprint 2 brief ("a simple
 * completion calculation is sufficient").
 */

export type FounderCompletionInput = {
  avatarUrl: string | null;
  jobTitle: string | null;
  country: string | null;
  bio: string | null;
  websiteUrl: string | null;
};

const FOUNDER_FIELD_COUNT = 5;

export function calculateFounderProfileCompletion(
  profile: FounderCompletionInput,
): number {
  const filled = [
    profile.avatarUrl,
    profile.jobTitle,
    profile.country,
    profile.bio,
    profile.websiteUrl,
  ].filter((value) => !!value && value.trim().length > 0).length;

  return Math.round((filled / FOUNDER_FIELD_COUNT) * 100);
}

export type InvestorCompletionInput = {
  avatarUrl: string | null;
  organization: string | null;
  country: string | null;
  investorType: string | null;
  bio: string | null;
  linkedinUrl: string | null;
  industryPreferenceCount: number;
  stagePreferenceCount: number;
};

const INVESTOR_FIELD_COUNT = 8;

export function calculateInvestorProfileCompletion(
  profile: InvestorCompletionInput,
): number {
  const filledScalarFields = [
    profile.avatarUrl,
    profile.organization,
    profile.country,
    profile.investorType,
    profile.bio,
    profile.linkedinUrl,
  ].filter((value) => !!value && value.trim().length > 0).length;

  const filled =
    filledScalarFields +
    (profile.industryPreferenceCount > 0 ? 1 : 0) +
    (profile.stagePreferenceCount > 0 ? 1 : 0);

  return Math.round((filled / INVESTOR_FIELD_COUNT) * 100);
}
