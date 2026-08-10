import type { Metadata } from "next";

import { getCurrentUserProfile } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Container } from "@/components/shared/container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/auth/actions";
import { SettingsPasswordForm } from "./settings-password-form";

export const metadata: Metadata = {
  title: "Settings",
};

/**
 * Account-management workspace - deliberately minimal, per the brief
 * ("do not over-design it"). Two sections:
 *
 *  - Account: the signed-in email (read-only - changing it isn't part
 *    of this sprint) and the password-change control.
 *  - Account actions: sign out.
 *
 * No Investor-account-creation, role-switching, or team-management
 * controls exist here - explicitly out of scope per the brief - and no
 * "Privacy / Security" section beyond the password control itself: a
 * generic list of security toggles/controls that don't actually do
 * anything yet would be exactly the kind of decorative,
 * no-product-purpose UI the brief warns against.
 */
export default async function FounderSettingsPage() {
  const current = await getCurrentUserProfile();
  if (!current) redirect("/login?next=/founder/settings");

  return (
    <Container className="max-w-2xl py-10 sm:py-12">
      <h1 className="text-h2 text-gray-900">Settings</h1>
      <p className="text-small mt-1 text-gray-500">Manage your account.</p>

      <div className="mt-8 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>{current.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsPasswordForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account actions</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={signOutAction}>
              <Button type="submit" variant="secondary">
                Log out
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
