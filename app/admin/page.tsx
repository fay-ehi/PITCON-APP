import { Flag } from "lucide-react";

import { Card } from "@/components/ui/card";
import { RecentSignupsList } from "@/components/admin/recent-signups-list";
import { RecentInterestsList } from "@/components/admin/recent-interests-list";
import { getRecentInterests, getRecentSignups } from "@/lib/queries/admin";

/**
 * The admin overview, added in the pre-launch hardening pass. Two real
 * panels (signups, interests) and one honest placeholder: there is no
 * flagging/reporting mechanism anywhere in the schema yet (no `reports`
 * table, no "flag this" action on a profile or message) - building one
 * is a real feature (a migration, RLS, a reporting UI for founders and
 * investors, a review workflow here) rather than something this page
 * can add on its own, so this section says that plainly instead of
 * shipping an empty table that looks like it works.
 */
export default async function AdminPage() {
  const [signups, interests] = await Promise.all([
    getRecentSignups(),
    getRecentInterests(),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="mb-4 text-h3 font-semibold text-gray-900">Recent signups</h2>
        <RecentSignupsList signups={signups} />
      </section>

      <section>
        <h2 className="mb-4 text-h3 font-semibold text-gray-900">Recent interests</h2>
        <RecentInterestsList interests={interests} />
      </section>

      <section>
        <h2 className="mb-4 text-h3 font-semibold text-gray-900">Flagged content</h2>
        <Card className="flex-row items-start gap-3 py-5">
          <Flag className="mt-0.5 size-5 shrink-0 text-gray-400" aria-hidden />
          <p className="text-small text-gray-500">
            No flagging or reporting mechanism exists in the app yet, so there&apos;s
            nothing to surface here. Adding one (a way for a founder or investor to
            report a profile, message, or startup, plus a review queue here) is a
            product decision, not something this page assumes on its own.
          </p>
        </Card>
      </section>
    </div>
  );
}
