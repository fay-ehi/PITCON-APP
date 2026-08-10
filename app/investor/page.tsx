import { redirect } from "next/navigation";

/**
 * `/investor` itself is kept alive only as a compatibility redirect (old
 * bookmarks/links, the sign-up/login/onboarding redirect chain from
 * before `roleHomePath` pointed straight at `/investor/discover`). See
 * app/founder/page.tsx for the mirrored Founder-side rationale.
 *
 * There is no dashboard content here - per the Sprint 5 brief, Discover
 * is the Investor's landing workspace, not a separate "/investor" page.
 */
export default function InvestorRootPage() {
  redirect("/investor/discover");
}
