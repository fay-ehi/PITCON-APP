import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ResendConfirmationButton } from "@/app/(auth)/verify-email/resend-confirmation-button";

export const metadata: Metadata = {
  title: "Check your email",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-50">
        <MailCheck className="size-6 text-primary" aria-hidden />
      </div>

      <h1 className="mt-6 text-h2 text-gray-900">Check your email</h1>
      <p className="mt-3 text-body text-gray-500">
        {email ? (
          <>
            We sent a confirmation link to{" "}
            <span className="font-medium text-gray-700">{email}</span>. Click
            it to activate your account.
          </>
        ) : (
          "We sent a confirmation link to your email address. Click it to activate your account."
        )}
      </p>

      <div className="mt-8 space-y-3">
        {email ? (
          <ResendConfirmationButton email={email} />
        ) : (
          <Button variant="secondary" className="w-full" asChild>
            <Link href="/signup">Back to sign up</Link>
          </Button>
        )}
        <Button variant="ghost" className="w-full" asChild>
          <Link href="/login">Back to login</Link>
        </Button>
      </div>
    </div>
  );
}
