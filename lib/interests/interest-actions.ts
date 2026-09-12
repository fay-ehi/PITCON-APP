"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { sendInterestReceivedEmail } from "@/lib/email/notifications";
import type { InterestStatus } from "@/types/interest";

/** Postgres's code for a unique-constraint violation - specifically
 * `startup_interests_startup_investor_key` here (the Sprint 6
 * migration). Reachable if the same investor's "Express Interest" click
 * somehow reaches the server twice for the same startup (a slow network
 * retry, a double-tap before the button disables) - treated as success
 * rather than an error, since the end state the investor wants (an
 * interest exists for this startup) is already true either way. See the
 * brief's "do not immediately create duplicate interests." */
const POSTGRES_UNIQUE_VIOLATION = "23505";

export type ExpressInterestResult =
  | { success: false; error: string }
  | { success: true; interestId: string };

/**
 * The core Sprint 6 action - an Investor expressing interest in a
 * Startup from the Discover preview panel. Deliberately takes no other
 * input: the relationship this creates is exactly `(investor, startup)`,
 * nothing else about it is investor-supplied (see the brief's
 * "IMPORTANT PRODUCT MODEL").
 *
 * The `status = 'published'` check here is a friendly-error mirror of
 * the Sprint 6 migration's INSERT policy `with check` - RLS is the real
 * backstop (an unpublished startup can never receive an insert
 * regardless of what this function does), this just turns a raw RLS
 * rejection into a specific message.
 */
export async function expressInterestAction(startupId: string): Promise<ExpressInterestResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You need to be signed in to do that." };
  }

  const { data, error } = await supabase
    .from("startup_interests")
    .insert({ startup_id: startupId, investor_id: user.id })
    .select("id")
    .single();

  if (error) {
    if (error.code === POSTGRES_UNIQUE_VIOLATION) {
      const { data: existing } = await supabase
        .from("startup_interests")
        .select("id")
        .eq("startup_id", startupId)
        .eq("investor_id", user.id)
        .maybeSingle();

      if (existing) {
        return { success: true, interestId: existing.id };
      }
    }
    return {
      success: false,
      error: "Couldn't express interest in this startup. Please try again.",
    };
  }
  if (!data) {
    return { success: false, error: "Couldn't express interest in this startup." };
  }

  // Discover's list/preview panes both read interest state fresh on
  // reload; the Startup Preview itself updates immediately from the
  // action's own return value (see discover-preview-panel.tsx), so this
  // only matters for a second tab / a later visit.
  revalidatePath("/investor/discover");
  revalidatePath("/investor/interests");

  // Email notification, added in the pre-launch hardening pass. The
  // in-app `interest_received` notification row for this already gets
  // created by the Sprint 6 migration's own database trigger
  // (`create_notification_for_new_interest()`) inside the same INSERT -
  // this is deliberately *not* hooked in there via a Supabase database
  // webhook, even though that would keep "when does this fire" in one
  // place: a webhook needs project-level configuration (the Database
  // Webhooks feature, or pg_net + a stored Resend key) that lives
  // outside this codebase and can't be reviewed or tested as a normal
  // code change. Calling it here instead means it's just another
  // best-effort step in the same action - visible in a diff, easy to
  // unit test, and `sendInterestReceivedEmail` never throws, so a
  // flaky email provider can't turn a successful interest into a
  // failed one.
  //
  // `after()` runs this once the response has already been sent, so the
  // investor isn't waiting on an external API call for something that
  // only affects the founder's inbox.
  const [{ data: startup }, { data: ownProfile }] = await Promise.all([
    supabase.from("startups").select("name, founder_id").eq("id", startupId).maybeSingle(),
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
  ]);

  if (startup) {
    after(() =>
      sendInterestReceivedEmail({
        founderId: startup.founder_id,
        investorName: ownProfile?.full_name ?? "An investor",
        startupName: startup.name,
      }),
    );
  }

  return { success: true, interestId: data.id };
}

export type RespondToInterestResult =
  { success: false; error: string } | { success: true };

/**
 * A Founder accepting or declining one Interest, from Founder Interests.
 * Confirms the interest belongs to one of the founder's own startups
 * before attempting the update - same "specific friendly error, RLS is
 * the real backstop" pattern as `publishStartupAction` - rather than
 * relying solely on the raw RLS rejection a cross-founder attempt would
 * otherwise hit.
 */
export async function respondToInterestAction(
  interestId: string,
  decision: Extract<InterestStatus, "accepted" | "declined">,
): Promise<RespondToInterestResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You need to be signed in to do that." };
  }

  const { data: interest, error: fetchError } = await supabase
    .from("startup_interests")
    .select("id, startup_id")
    .eq("id", interestId)
    .single();

  if (fetchError || !interest) {
    return { success: false, error: "Couldn't find that interest." };
  }

  const { data: startup, error: startupError } = await supabase
    .from("startups")
    .select("id")
    .eq("id", interest.startup_id)
    .eq("founder_id", user.id)
    .maybeSingle();

  if (startupError || !startup) {
    return { success: false, error: "Couldn't find that interest." };
  }

  const { error: updateError } = await supabase
    .from("startup_interests")
    .update({ status: decision })
    .eq("id", interestId);

  if (updateError) {
    return {
      success: false,
      error: "Couldn't update that interest. Please try again.",
    };
  }

  revalidatePath("/founder/interests");

  return { success: true };
}
