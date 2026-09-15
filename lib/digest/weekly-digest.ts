import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send-email";
import { getEmailRecipient } from "@/lib/email/notifications";
import { founderWeeklyDigestEmail } from "@/lib/email/templates/founder-weekly-digest";
import { investorWeeklyDigestEmail } from "@/lib/email/templates/investor-weekly-digest";
import { getSiteURL } from "@/lib/site-url";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_SAMPLE_STARTUP_NAMES = 3;

export interface WeeklyDigestResult {
  founderEmailsSent: number;
  investorEmailsSent: number;
  errors: number;
}

/**
 * Sprint 16. Triggered by app/api/cron/weekly-digest/route.ts, not by
 * any user action - see that route's own comment for how it's
 * scheduled. Everything here is batched (one query per table, grouped
 * in memory) rather than looped per founder/investor - the founder
 * loop below, for instance, never re-queries `startups`/`startup_
 * views`/`startup_interests` per person, since all three are small
 * enough to fetch once and group. The one per-user cost that can't be
 * batched is `getEmailRecipient` (Supabase's Admin Auth API has no
 * bulk "get these user ids" endpoint), so this scales with number of
 * emails actually sent, not with table size - fine at this platform's
 * current size, worth revisiting if the user base grows to where a
 * weekly run's wall-clock time actually matters.
 *
 * Both halves independently decide, per person, whether there's
 * anything worth emailing about at all - most of this function's
 * length is that filtering, not the sending. See each template's own
 * comment for why that doubles as this project's re-engagement digest
 * without a separate "inactive user" detection pass.
 */
export async function sendWeeklyDigests(): Promise<WeeklyDigestResult> {
  const admin = createAdminClient();
  const sinceIso = new Date(Date.now() - SEVEN_DAYS_MS).toISOString();

  const [founderResult, investorResult] = await Promise.all([
    sendFounderDigests(admin, sinceIso),
    sendInvestorDigests(admin, sinceIso),
  ]);

  return {
    founderEmailsSent: founderResult.sent,
    investorEmailsSent: investorResult.sent,
    errors: founderResult.errors + investorResult.errors,
  };
}

async function sendFounderDigests(
  admin: ReturnType<typeof createAdminClient>,
  sinceIso: string,
): Promise<{ sent: number; errors: number }> {
  const { data: startupRows, error: startupsError } = await admin
    .from("startups")
    .select("id, founder_id, name, status");
  if (startupsError) {
    throw new Error(`[digest] Failed to load startups: ${startupsError.message}`);
  }

  const startups = startupRows ?? [];
  if (startups.length === 0) return { sent: 0, errors: 0 };

  const publishedStartupIds = startups.filter((s) => s.status === "published").map((s) => s.id);

  const [{ data: viewRows, error: viewsError }, { data: interestRows, error: interestsError }] =
    await Promise.all([
      publishedStartupIds.length > 0
        ? admin
            .from("startup_views")
            .select("startup_id, investor_id")
            .in("startup_id", publishedStartupIds)
            .gte("viewed_on", sinceIso.slice(0, 10))
        : Promise.resolve({ data: [] as { startup_id: string; investor_id: string }[], error: null }),
      publishedStartupIds.length > 0
        ? admin
            .from("startup_interests")
            .select("startup_id")
            .in("startup_id", publishedStartupIds)
            .gte("created_at", sinceIso)
        : Promise.resolve({ data: [] as { startup_id: string }[], error: null }),
    ]);

  if (viewsError) throw new Error(`[digest] Failed to load views: ${viewsError.message}`);
  if (interestsError) throw new Error(`[digest] Failed to load interests: ${interestsError.message}`);

  const startupsByFounder = new Map<string, typeof startups>();
  for (const startup of startups) {
    const list = startupsByFounder.get(startup.founder_id) ?? [];
    list.push(startup);
    startupsByFounder.set(startup.founder_id, list);
  }

  const startupToFounder = new Map(startups.map((s) => [s.id, s.founder_id]));
  const viewsByFounder = new Map<string, { count: number; investorIds: Set<string> }>();
  for (const view of viewRows ?? []) {
    const founderId = startupToFounder.get(view.startup_id);
    if (!founderId) continue;
    const entry = viewsByFounder.get(founderId) ?? { count: 0, investorIds: new Set<string>() };
    entry.count += 1;
    entry.investorIds.add(view.investor_id);
    viewsByFounder.set(founderId, entry);
  }

  const interestsByFounder = new Map<string, number>();
  for (const interest of interestRows ?? []) {
    const founderId = startupToFounder.get(interest.startup_id);
    if (!founderId) continue;
    interestsByFounder.set(founderId, (interestsByFounder.get(founderId) ?? 0) + 1);
  }

  let sent = 0;
  let errors = 0;

  for (const [founderId, founderStartups] of startupsByFounder) {
    try {
      const draft = founderStartups.find((s) => s.status === "draft");
      const viewEntry = viewsByFounder.get(founderId);
      const newInterestCount = interestsByFounder.get(founderId) ?? 0;
      const viewCount = viewEntry?.count ?? 0;

      // Nothing worth emailing about this week - a founder with a
      // fully published, unremarkable-week startup and no draft
      // sitting unfinished gets skipped rather than a hollow "0 views"
      // email.
      if (viewCount === 0 && newInterestCount === 0 && !draft) continue;

      const recipient = await getEmailRecipient(founderId);
      if (!recipient) continue;

      const { subject, html, text } = founderWeeklyDigestEmail({
        fullName: recipient.fullName,
        viewCount,
        uniqueInvestorCount: viewEntry?.investorIds.size ?? 0,
        newInterestCount,
        incompleteDraftName: draft?.name ?? null,
        dashboardUrl: `${getSiteURL()}/founder/startups`,
      });

      await sendEmail({ to: recipient.email, subject, html, text });
      sent += 1;
    } catch (error) {
      console.error(`[digest] Failed to send founder digest for ${founderId}:`, error);
      errors += 1;
    }
  }

  return { sent, errors };
}

async function sendInvestorDigests(
  admin: ReturnType<typeof createAdminClient>,
  sinceIso: string,
): Promise<{ sent: number; errors: number }> {
  const { data: newStartupRows, error: startupsError } = await admin
    .from("startups")
    .select("id, name, industry_id, stage_id")
    .eq("status", "published")
    .gte("published_at", sinceIso);
  if (startupsError) {
    throw new Error(`[digest] Failed to load new startups: ${startupsError.message}`);
  }

  const newStartups = newStartupRows ?? [];
  if (newStartups.length === 0) return { sent: 0, errors: 0 };

  const { data: investorRows, error: investorsError } = await admin
    .from("investor_profiles")
    .select("id");
  if (investorsError) {
    throw new Error(`[digest] Failed to load investors: ${investorsError.message}`);
  }

  const investorIds = (investorRows ?? []).map((r) => r.id);
  if (investorIds.length === 0) return { sent: 0, errors: 0 };

  const [{ data: industryPrefRows, error: industryPrefError }, { data: stagePrefRows, error: stagePrefError }] =
    await Promise.all([
      admin.from("investor_industry_preferences").select("investor_id, industry_id").in("investor_id", investorIds),
      admin.from("investor_stage_preferences").select("investor_id, stage_id").in("investor_id", investorIds),
    ]);

  if (industryPrefError) throw new Error(`[digest] Failed to load preferences: ${industryPrefError.message}`);
  if (stagePrefError) throw new Error(`[digest] Failed to load preferences: ${stagePrefError.message}`);

  const industryPrefsByInvestor = new Map<string, Set<string>>();
  for (const row of industryPrefRows ?? []) {
    const set = industryPrefsByInvestor.get(row.investor_id) ?? new Set<string>();
    set.add(row.industry_id);
    industryPrefsByInvestor.set(row.investor_id, set);
  }
  const stagePrefsByInvestor = new Map<string, Set<string>>();
  for (const row of stagePrefRows ?? []) {
    const set = stagePrefsByInvestor.get(row.investor_id) ?? new Set<string>();
    set.add(row.stage_id);
    stagePrefsByInvestor.set(row.investor_id, set);
  }

  let sent = 0;
  let errors = 0;

  for (const investorId of investorIds) {
    try {
      const industryPrefs = industryPrefsByInvestor.get(investorId);
      const stagePrefs = stagePrefsByInvestor.get(investorId);
      const hasPreferences = Boolean(industryPrefs?.size || stagePrefs?.size);

      // Matches ANY saved preference (industry OR stage), not both at
      // once - an investor who only set an industry preference (no
      // stage) shouldn't see zero matches just because stage was never
      // asked about.
      const matched = hasPreferences
        ? newStartups.filter(
            (s) =>
              (s.industry_id && industryPrefs?.has(s.industry_id)) ||
              (s.stage_id && stagePrefs?.has(s.stage_id)),
          )
        : newStartups;

      if (matched.length === 0) continue;

      const recipient = await getEmailRecipient(investorId);
      if (!recipient) continue;

      const { subject, html, text } = investorWeeklyDigestEmail({
        fullName: recipient.fullName,
        newStartupCount: matched.length,
        sampleStartupNames: matched
          .slice(0, MAX_SAMPLE_STARTUP_NAMES)
          .map((s) => s.name ?? "Untitled startup"),
        matchedPreferences: hasPreferences,
        discoverUrl: `${getSiteURL()}/investor/discover`,
      });

      await sendEmail({ to: recipient.email, subject, html, text });
      sent += 1;
    } catch (error) {
      console.error(`[digest] Failed to send investor digest for ${investorId}:`, error);
      errors += 1;
    }
  }

  return { sent, errors };
}
