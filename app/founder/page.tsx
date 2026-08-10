import { redirect } from "next/navigation";

/**
 * `/founder` itself is kept alive only as a compatibility redirect
 * (old bookmarks/links, the sign-up/login redirect chain before
 * `roleHomePath` was updated to point straight at `/founder/startups`).
 * There is no dashboard content here - per the Sprint 4 brief, My
 * Startups (behind the sidebar's first item) is the Founder's landing
 * workspace, not a separate "/founder" page.
 */
export default function FounderRootPage() {
  redirect("/founder/startups");
}
