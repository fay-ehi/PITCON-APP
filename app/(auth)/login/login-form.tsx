"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormBanner } from "@/components/shared/form-banner";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { loginAction } from "@/app/(auth)/login/actions";

function LoginForm({
  next,
  initialError,
  initialNotice,
}: {
  next?: string;
  initialError?: string;
  initialNotice?: string;
}) {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | undefined>(
    initialError,
  );
  const [notice] = React.useState<string | undefined>(
    initialError ? undefined : initialNotice,
  );

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setFormError(undefined);
    setIsSubmitting(true);
    try {
      const result = await loginAction(values, next);
      if (!result.success) {
        setIsSubmitting(false);
        setFormError(result.error);
        return;
      }
      // Keep the button in its loading state through the navigation
      // itself, rather than flashing back to "Log in" for a moment first.
      router.push(result.redirectTo);
    } catch {
      setIsSubmitting(false);
      setFormError("Something went wrong. Please try again.");
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-h3 text-gray-900">Welcome to PITCON</h1>
        <p className="mt-2 text-small text-gray-500">
          Log in to pick up where you left off.
        </p>
      </div>

      {formError && <FormBanner>{formError}</FormBanner>}
      {notice && <FormBanner variant="success">{notice}</FormBanner>}

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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-caption font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="pr-10"
              aria-invalid={!!form.formState.errors.password}
              aria-describedby={
                form.formState.errors.password ? "password-error" : undefined
              }
              {...form.register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden />
              ) : (
                <Eye className="size-4" aria-hidden />
              )}
            </button>
          </div>
          {form.formState.errors.password && (
            <p id="password-error" className="text-caption text-destructive">
              {form.formState.errors.password.message}
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
              Signing in...
            </>
          ) : (
            "Log in"
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-small text-gray-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-primary hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}

export { LoginForm };
