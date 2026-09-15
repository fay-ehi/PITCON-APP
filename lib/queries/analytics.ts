import { createClient } from "@/lib/supabase/server";
import type {
  StartupAnalyticsSummary,
  StartupViewer,
  StartupViewsByDay,
} from "@/types/analytics";

const TREND_DAYS = 14;
const MAX_RECENT_VIEWERS = 8;

function emptySummary(): StartupAnalyticsSummary {
  return {
    totalViews: 0,
    uniqueInvestorCount: 0,
    viewsLast14Days: last14DayKeys().map((date) => ({ date, count: 0 })),
    recentViewers: [],
  };
}

/** The last `TREND_DAYS` calendar dates as `YYYY-MM-DD`, oldest first,
 * today included - matching `startup_views.viewed_on`'s own default
 * (`current_date`, the Postgres server's UTC clock). A day-boundary
 * mismatch against a founder viewing this in a very different time
 * zone is a acceptable rounding error for an MVP trend, not something
 * worth a timezone-aware rewrite of this query. */
function last14DayKeys(): string[] {
  const keys: string[] = [];
  for (let i = TREND_DAYS - 1; i >= 0; i--) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - i);
    keys.push(date.toISOString().slice(0, 10));
  }
  return keys;
}

/**
 * Founder Analytics for one startup - total views, a unique-investor
 * count, a zero-filled 14-day trend, and a capped "recently viewed by"
 * list (most recent view per investor, newest first). Backs the
 * Insights section of app/founder/startups/[startupId]/page.tsx.
 *
 * Re-checks `founder_id` explicitly before touching `startup_views`,
 * same "defense in depth on top of RLS" precedent as
 * `getStartupById` - the Sprint 12 migration's RLS policy is the real
 * backstop either way, this just avoids doing any further work for a
 * startup id that was never the caller's own.
 *
 * Returns an all-zero/empty summary both when the startup isn't the
 * caller's own and when it simply has no views yet - a startup that's
 * still a draft can never have been viewed (drafts never appear in
 * Discover), so an empty summary there is the normal pre-launch state,
 * not an error.
 */
export async function getStartupAnalytics(
  startupId: string,
  founderId: string,
): Promise<StartupAnalyticsSummary> {
  const supabase = await createClient();

  const { data: ownStartup, error: ownershipError } = await supabase
    .from("startups")
    .select("id")
    .eq("id", startupId)
    .eq("founder_id", founderId)
    .maybeSingle();

  if (ownershipError) {
    throw new Error(`Failed to load startup: ${ownershipError.message}`);
  }
  if (!ownStartup) return emptySummary();

  const { data: viewRows, error } = await supabase
    .from("startup_views")
    .select("investor_id, viewed_on, created_at")
    .eq("startup_id", startupId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load startup views: ${error.message}`);
  }

  const views = viewRows ?? [];
  if (views.length === 0) return emptySummary();

  const countsByDay = new Map<string, number>();
  for (const view of views) {
    countsByDay.set(view.viewed_on, (countsByDay.get(view.viewed_on) ?? 0) + 1);
  }
  const viewsLast14Days: StartupViewsByDay[] = last14DayKeys().map((date) => ({
    date,
    count: countsByDay.get(date) ?? 0,
  }));

  // `views` is already newest-first, so the first time we see a given
  // investor id here is that investor's most recent view.
  const latestViewedAtByInvestor = new Map<string, string>();
  const uniqueInvestorIds: string[] = [];
  for (const view of views) {
    if (!latestViewedAtByInvestor.has(view.investor_id)) {
      latestViewedAtByInvestor.set(view.investor_id, view.created_at);
      uniqueInvestorIds.push(view.investor_id);
    }
  }

  const recentViewerIds = uniqueInvestorIds.slice(0, MAX_RECENT_VIEWERS);
  let recentViewers: StartupViewer[] = [];

  if (recentViewerIds.length > 0) {
    // Same batched-lookup shape as getFounderInterests - two `.in()`
    // queries rather than a deep embed, kept simple and predictable
    // under RLS (here, the Sprint 12 migration's "Founders can read
    // investor profiles for viewers of their startups" policies).
    const [
      { data: investorProfileRows, error: investorProfileError },
      { data: profileRows, error: profileError },
    ] = await Promise.all([
      supabase
        .from("investor_profiles")
        .select("id, organization, investor_type, verified")
        .in("id", recentViewerIds),
      supabase.from("profiles").select("id, full_name, avatar_url").in("id", recentViewerIds),
    ]);

    if (investorProfileError) {
      throw new Error(`Failed to load viewer profiles: ${investorProfileError.message}`);
    }
    if (profileError) {
      throw new Error(`Failed to load viewer profiles: ${profileError.message}`);
    }

    const investorProfileById = new Map((investorProfileRows ?? []).map((row) => [row.id, row]));
    const profileById = new Map((profileRows ?? []).map((row) => [row.id, row]));

    recentViewers = recentViewerIds.map((investorId) => {
      const investorProfile = investorProfileById.get(investorId);
      const profile = profileById.get(investorId);
      return {
        investorId,
        // Falls back rather than dropping the row - shouldn't happen
        // (RLS + the FK guarantee a matching row), but a placeholder
        // is cheaper than failing the whole list over one stale-
        // looking entry.
        fullName: profile?.full_name ?? "Investor",
        avatarUrl: profile?.avatar_url ?? null,
        organization: investorProfile?.organization ?? null,
        investorType: investorProfile?.investor_type ?? null,
        viewedAt: latestViewedAtByInvestor.get(investorId)!,
        verified: investorProfile?.verified ?? false,
      };
    });
  }

  return {
    totalViews: views.length,
    uniqueInvestorCount: uniqueInvestorIds.length,
    viewsLast14Days,
    recentViewers,
  };
}
