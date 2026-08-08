import type { Metadata } from "next";

import { getCurrentUserProfile } from "@/lib/auth/session";
import { Container } from "@/components/shared/container";

export const metadata: Metadata = {
  title: "Investor",
};

/**
 * Placeholder only: the real investor discovery experience is a later
 * sprint. See app/founder/page.tsx for the mirrored rationale.
 */
export default async function InvestorHomePage() {
  const current = await getCurrentUserProfile();

  return (
    <Container className="py-16">
      <h1 className="text-h1 text-gray-900">
        Welcome, {current?.profile.full_name.split(" ")[0]}.
      </h1>
      <p className="mt-3 max-w-lg text-body text-gray-500">
        You&apos;re signed in as an investor. Startup discovery, search,
        and bookmarks are on the way in a later sprint.
      </p>
    </Container>
  );
}
