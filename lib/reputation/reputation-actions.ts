"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEngagementSummary } from "@/lib/queries/reputation";
import type { EngagementSummary } from "@/types/reputation";

/**
 * Sprint 14. Two purpose-specific actions rather than one generic
 * `getEngagementSummaryAction(userId, role)` - deliberately, because
 * the two call sites don't actually have the same thing available.
 * `interest-detail-dialog.tsx` (a founder looking at an investor)
 * already has the investor's real id (`interest.investor.id` is
 * already exposed to that founder's session). `discover-preview-
 * dialog.tsx` (an investor looking at a founder) only has a
 * `StartupDetail`, which deliberately never carries `founder_id` at
 * all - see that type's own comment on why. Rather than adding it
 * there just to serve this one feature, this resolves the founder's
 * id server-side, inside the same admin-client call that computes the
 * summary, so the founder's raw user id never needs to reach the
 * investor's browser in the first place.
 *
 * Both are Server Actions rather than eager server-side fetches folded
 * into `getFounderInterests`/Discover's own queries - see
 * lib/queries/reputation.ts's own comment on why this is computed
 * lazily, on dialog open, rather than for every row in a list.
 *
 * Both only require an authenticated session, not any specific
 * relationship to the person being looked up - see
 * getEngagementSummary's own comment on why that's safe (three
 * harmless aggregate numbers, no conversation/startup detail).
 */
export async function getInvestorEngagementSummaryAction(
  investorId: string,
): Promise<EngagementSummary | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return getEngagementSummary(investorId, "investor");
}

export async function getFounderEngagementSummaryAction(
  startupId: string,
): Promise<EngagementSummary | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = createAdminClient();
  const { data: startup, error } = await admin
    .from("startups")
    .select("founder_id")
    .eq("id", startupId)
    .maybeSingle();

  if (error || !startup) return null;

  return getEngagementSummary(startup.founder_id, "founder");
}
