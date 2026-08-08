"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Eye, EyeOff, Loader2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  signUpAccountDetailsSchema,
  signUpSchema,
  type SignUpInput,
} from "@/lib/validations/auth";
import { signUpAction } from "@/app/(auth)/signup/actions";

const ACCOUNT_DETAILS_FIELDS = [
  "fullName",
  "email",
  "password",
  "confirmPassword",
] as const;

function SignUpForm() {
  const router = useRouter();
  const [step, setStep] = React.useState<1 | 2>(1);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: undefined,
    },
    mode: "onBlur",
  });

  const selectedRole = useWatch({ control: form.control, name: "role" });

  function handleContinue() {
    // Validated directly against the step-1-only schema rather than via
    // form.trigger(ACCOUNT_DETAILS_FIELDS): trigger() re-runs the *whole*
    // signUpSchema resolver under the hood (including the still-unset
    // `role` field), and with a cross-field .refine() in the mix, some
    // resolver versions let that unrelated failure suppress the result
    // for the fields actually being checked, i.e. Continue silently
    // does nothing. Parsing signUpAccountDetailsSchema directly sidesteps
    // that entirely.
    const result = signUpAccountDetailsSchema.safeParse(form.getValues());

    form.clearErrors(ACCOUNT_DETAILS_FIELDS);

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (
          typeof field === "string" &&
          (ACCOUNT_DETAILS_FIELDS as readonly string[]).includes(field)
        ) {
          form.setError(field as (typeof ACCOUNT_DETAILS_FIELDS)[number], {
            message: issue.message,
          });
        }
      }
      return;
    }

    setStep(2);
  }

  async function onSubmit(values: SignUpInput) {
    // Defense in depth: re-check the account-details fields with their
    // own schema too, in case step 1 was somehow bypassed.
    const detailsCheck = signUpAccountDetailsSchema.safeParse(values);
    if (!detailsCheck.success) {
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signUpAction(values);
      if (!result.success) {
        setIsSubmitting(false);
        if (result.field) {
          form.setError(result.field, { message: result.error });
          if (result.field !== "role") setStep(1);
        } else {
          toast.error(result.error);
        }
        return;
      }
      router.push(result.redirectTo);
    } catch {
      setIsSubmitting(false);
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-h3 text-gray-900">
          {step === 1 ? "Welcome to PITCON" : "How will you use PITCON?"}
        </h1>
        <p className="mt-2 text-small text-gray-500">
          {step === 1
            ? "Sign up to turn your big idea into a funded one."
            : "Step 2 of 2: this determines the experience you'll get."}
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className={cn("space-y-5", step !== 1 && "hidden")}>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              type="text"
              autoComplete="name"
              placeholder="Ada Okafor"
              aria-invalid={!!form.formState.errors.fullName}
              aria-describedby={
                form.formState.errors.fullName
                  ? "fullName-error"
                  : undefined
              }
              {...form.register("fullName")}
            />
            {form.formState.errors.fullName && (
              <p id="fullName-error" className="text-caption text-destructive">
                {form.formState.errors.fullName.message}
              </p>
            )}
          </div>

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
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className="pr-10"
                aria-invalid={!!form.formState.errors.password}
                aria-describedby={
                  form.formState.errors.password
                    ? "password-error"
                    : "password-hint"
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
            {form.formState.errors.password ? (
              <p id="password-error" className="text-caption text-destructive">
                {form.formState.errors.password.message}
              </p>
            ) : (
              <p id="password-hint" className="text-caption text-gray-400">
                At least 8 characters, with a letter and a number.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                className="pr-10"
                aria-invalid={!!form.formState.errors.confirmPassword}
                aria-describedby={
                  form.formState.errors.confirmPassword
                    ? "confirmPassword-error"
                    : undefined
                }
                {...form.register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
                aria-pressed={showConfirmPassword}
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4" aria-hidden />
                ) : (
                  <Eye className="size-4" aria-hidden />
                )}
              </button>
            </div>
            {form.formState.errors.confirmPassword && (
              <p
                id="confirmPassword-error"
                className="text-caption text-destructive"
              >
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="button"
            className="w-full"
            size="lg"
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>

        <div className={cn("space-y-5", step !== 2 && "hidden")}>
          <fieldset>
            <legend className="sr-only">Account type</legend>
            <div
              role="radiogroup"
              aria-label="Account type"
              className="grid gap-3 sm:grid-cols-2"
            >
              <RoleOption
                icon={Building2}
                title="I'm a founder"
                description="I'm building a business and looking for funding."
                selected={selectedRole === "founder"}
                onSelect={() =>
                  form.setValue("role", "founder", { shouldValidate: true })
                }
              />
              <RoleOption
                icon={TrendingUp}
                title="I'm an investor"
                description="I'm looking for startups and investment opportunities."
                selected={selectedRole === "investor"}
                onSelect={() =>
                  form.setValue("role", "investor", { shouldValidate: true })
                }
              />
            </div>
            {form.formState.errors.role && (
              <p className="mt-2 text-caption text-destructive">
                {form.formState.errors.role.message}
              </p>
            )}
          </fieldset>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => setStep(1)}
            >
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </div>
        </div>
      </form>

      <p className="mt-8 text-center text-small text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

function RoleOption({
  icon: Icon,
  title,
  description,
  selected,
  onSelect,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex flex-col items-start gap-3 rounded-card border p-5 text-left transition-colors",
        selected
          ? "border-primary bg-primary-50 ring-2 ring-primary/20"
          : "border-border bg-white hover:border-gray-300 hover:bg-gray-50",
      )}
    >
      <span
        className={cn(
          "flex size-10 items-center justify-center rounded-control",
          selected ? "bg-primary text-white" : "bg-gray-100 text-gray-500",
        )}
      >
        <Icon className="size-5" />
      </span>
      <span>
        <span className="block text-small font-semibold text-gray-900">
          {title}
        </span>
        <span className="mt-1 block text-caption text-gray-500">
          {description}
        </span>
      </span>
    </button>
  );
}

export { SignUpForm };
