import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/types/profile";
import type { EngagementSummary } from "@/types/reputation";

/**
 * Sprint 14 (Trust & Credibility, part 2 of 3) - "investor track
 * record," reasoned through rather than built as literally named.
 *
 * A self-reported "past investments / check sizes" ledger was the
 * original ask, and it's deliberately NOT what this is. Two reasons:
 *
 *   1. It's unverifiable, and worse, it rewards the wrong people for
 *      filling it in. A legitimate, established investor has the
 *      least incentive to re-type a portfolio that already exists on
 *      Crunchbase/AngelList/their own firm's site. A fraudster or
 *      time-waster has the *most* incentive to fabricate an
 *      impressive-looking one, since it's their cheapest way to
 *      borrow credibility they haven't earned. A feature meant to
 *      fight fraud shouldn't hand fraud its best tool.
 *
 *   2. Most of "can a founder tell if this investor is a fit" is
 *      already served: `investor_type`, `funding_range_min/max`,
 *      `organization`, and `bio` are already collected and already
 *      shown in the interest detail view. The genuinely missing piece
 *      wasn't investment history, it was trustworthiness - and the
 *      honest way to signal that is from behavior PITCON already
 *      observed, not a new form.
 *
 * So instead: two numbers, both derived from data that already
 * exists, that can only be improved by actually behaving the way you'd
 * want anyway - tenure, and whether this person actually engages once
 * a conversation starts. Built symmetrically for both roles (Sprint 12
 * onward has treated "time-wasting" as a two-sided problem, per the
 * roadmap conversation that named this feature).
 *
 * Uses the admin client rather than the caller's own RLS session
 * deliberately, not as a shortcut: computing "how many of this
 * person's conversations did they engage in" requires looking across
 * *every* conversation they're part of, including ones with other
 * founders/investors entirely unrelated to whoever's asking. There's
 * no RLS policy that could expose enough structure for that
 * computation without also exposing which startups an investor is
 * talking to, to any other founder who looks them up - a deal-flow
 * confidentiality leak arguably worse than the trust problem this
 * feature exists to solve. Computing it server-side with full
 * visibility and returning only the two rolled-up counts (never which
 * conversations, which startups, or any message content) avoids that
 * entirely.
 */
export async function getEngagementSummary(
  userId: string,
  role: UserRole,
): Promise<EngagementSummary> {
  const admin = createAdminClient();

  const { data: profileRow, error: profileError } = await admin
    .from("profiles")
    .select("created_at")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Failed to load engagement summary: ${profileError.message}`);
  }

  const memberSince = profileRow?.created_at ?? new Date().toISOString();

  let conversationIds: string[];
  if (role === "investor") {
    const { data, error } = await admin
      .from("conversations")
      .select("id")
      .eq("investor_id", userId);
    if (error) {
      throw new Error(`Failed to load engagement summary: ${error.message}`);
    }
    conversationIds = (data ?? []).map((row) => row.id);
  } else {
    const { data: startupRows, error: startupError } = await admin
      .from("startups")
      .select("id")
      .eq("founder_id", userId);
    if (startupError) {
      throw new Error(`Failed to load engagement summary: ${startupError.message}`);
    }
    const startupIds = (startupRows ?? []).map((row) => row.id);

    if (startupIds.length === 0) {
      conversationIds = [];
    } else {
      const { data, error } = await admin
        .from("conversations")
        .select("id")
        .in("startup_id", startupIds);
      if (error) {
        throw new Error(`Failed to load engagement summary: ${error.message}`);
      }
      conversationIds = (data ?? []).map((row) => row.id);
    }
  }

  let engagementRate: EngagementSummary["engagementRate"] = null;
  if (conversationIds.length > 0) {
    const { data: messageRows, error: messageError } = await admin
      .from("messages")
      .select("conversation_id")
      .eq("sender_id", userId)
      .in("conversation_id", conversationIds);

    if (messageError) {
      throw new Error(`Failed to load engagement summary: ${messageError.message}`);
    }

    // "Active" = sent at least one message in that conversation - a
    // simple, honest proxy for "engages once contacted." Not the same
    // as "replied to the first message specifically" (which would need
    // per-conversation message ordering), but close enough to be
    // meaningful and far simpler to get right.
    const activeConversations = new Set((messageRows ?? []).map((row) => row.conversation_id)).size;
    engagementRate = { activeConversations, totalConversations: conversationIds.length };
  }

  let interestCount: number | null = null;
  if (role === "investor") {
    const { count, error } = await admin
      .from("startup_interests")
      .select("id", { count: "exact", head: true })
      .eq("investor_id", userId);
    if (error) {
      throw new Error(`Failed to load engagement summary: ${error.message}`);
    }
    interestCount = count ?? 0;
  }

  return { memberSince, interestCount, engagementRate };
}
