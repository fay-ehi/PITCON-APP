"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormBanner } from "@/components/shared/form-banner";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";
import { requestPasswordResetAction } from "@/app/(auth)/forgot-password/actions";

function ForgotPasswordForm({ initialError }: { initialError?: string }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | undefined>(
    initialError,
  );
  const [sentTo, setSentTo] = React.useState<string | null>(null);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordInput) {
    setFormError(undefined);
    setIsSubmitting(true);
    try {
      const result = await requestPasswordResetAction(values);
      if ("error" in result) {
        setFormError(result.error);
      } else {
        setSentTo(values.email);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (sentTo) {
    return (
      <div className="text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-50">
          <MailCheck className="size-6 text-primary" aria-hidden />
        </div>
        <h1 className="mt-6 text-h2 text-gray-900">Check your email</h1>
        <p className="mt-3 text-body text-gray-500">
          If an account exists for{" "}
          <span className="font-medium text-gray-700">{sentTo}</span>,
          we&apos;ve sent a link to reset your password.
        </p>
        <Button variant="ghost" className="mt-8 w-full" asChild>
          <Link href="/login">Back to login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-h2 text-gray-900">Forgot your password?</h1>
        <p className="mt-2 text-small text-gray-500">
          Enter your email and we&apos;ll send you a link to reset it.
        </p>
      </div>

      {formError && <FormBanner>{formError}</FormBanner>}

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="space-y-5"
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!form.formState.errors.email}
            aria-describedby={
              form.formState.errors.email ? "email-error" : undefined
            }
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p id="email-error" className="text-caption text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" aria-hidden />
              Sending reset link...
            </>
          ) : (
            "Send reset link"
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-small text-gray-500">
        Remembered it after all?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

export { ForgotPasswordForm };
