import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUserProfile } from "@/lib/auth/session";
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
 * Investor Account-management workspace - mirrors
 * app/founder/settings/page.tsx exactly (same "do not over-design it"
 * rationale, same two sections: Account + password change, and Account
 * actions/sign out). No Founder-account-creation or role-switching
 * controls here either, per the Sprint 5 brief.
 */
export default async function InvestorSettingsPage() {
  const current = await getCurrentUserProfile();
  if (!current) redirect("/login?next=/investor/settings");

  return (
    <Container className="max-w-2xl py-10 sm:py-12">
      <h1 className="text-h2 text-gray-900">Settings</h1>
      <p className="mt-1 text-small text-gray-500">Manage your account.</p>

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
