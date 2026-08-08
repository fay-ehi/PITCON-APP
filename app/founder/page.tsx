import type { Metadata } from "next";

import { getCurrentUserProfile } from "@/lib/auth/session";
import { Container } from "@/components/shared/container";

export const metadata: Metadata = {
  title: "Founder",
};

/**
 * Placeholder only: the real founder dashboard (Screen 6 in the Design
 * System doc) is a later sprint. This exists to prove the auth + role
 * protection architecture end to end: signed-out visitors and signed-in
 * investors can't reach this page (see app/founder/layout.tsx and
 * proxy.ts), and a signed-in founder lands here right after signup or
 * login.
 */
export default async function FounderHomePage() {
  const current = await getCurrentUserProfile();

  return (
    <Container className="py-16">
      <h1 className="text-h1 text-gray-900">
        Welcome, {current?.profile.full_name.split(" ")[0]}.
      </h1>
      <p className="mt-3 max-w-lg text-body text-gray-500">
        You&apos;re signed in as a founder. Your dashboard, startup
        profile, investor interest, and messaging, is on the way in a
        later sprint.
      </p>
    </Container>
  );
}
