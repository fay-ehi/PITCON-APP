import { NextResponse } from "next/server";

import { sendWeeklyDigests } from "@/lib/digest/weekly-digest";

/**
 * Sprint 16. The app's first Route Handler and first piece of
 * scheduled (not user-triggered) infrastructure - everything else that
 * sends email so far fires from inside a Server Action via `after()`,
 * which only ever runs in response to something a signed-in user just
 * did. A weekly digest has no such action to hang off of, so it needs
 * something to actually call it on a schedule.
 *
 * `vercel.json`'s `crons` entry is the default wiring (this project's
 * stack - Next.js + Supabase - pairs most commonly with a Vercel
 * deployment, and Vercel Cron needs nothing beyond that file plus this
 * route). If this isn't deployed on Vercel, nothing here assumes it
 * has to be: point any scheduler (a GitHub Actions cron workflow,
 * Supabase's own pg_cron via `net.http_get`, an external service like
 * cron-job.org) at `GET /api/cron/weekly-digest` with the same bearer
 * token instead.
 *
 * `CRON_SECRET` (see .env.example) is the only thing standing between
 * this and anyone on the internet triggering a full email blast -
 * Vercel Cron sends it automatically as `Authorization: Bearer
 * <CRON_SECRET>` on every invocation it makes, so no extra
 * configuration is needed for the default wiring; a different
 * scheduler needs to be told to send the same header.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await sendWeeklyDigests();
    return NextResponse.json(result);
  } catch (error) {
    console.error("[digest] Weekly digest run failed:", error);
    return NextResponse.json({ error: "Digest run failed" }, { status: 500 });
  }
}
