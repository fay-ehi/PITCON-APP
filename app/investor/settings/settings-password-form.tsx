"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateAccountPasswordAction } from "@/lib/auth/actions";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth";

/**
 * The Investor Settings workspace's "change password" control - a
 * direct copy of app/founder/settings/settings-password-form.tsx
 * (Sprint 4's Account/Security action). Nothing here is
 * founder-specific - same `resetPasswordSchema`, same
 * `updateAccountPasswordAction` - so this is a straight duplicate
 * rather than a shared import, consistent with how the rest of
 * PITCON keeps founder/investor UI pieces (e.g. topbar.tsx) as
 * separate, page-local files even when their contents are close to
 * identical.
 */
function SettingsPasswordForm() {
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm<ResetPasswordInput>({
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onBlur",
  });

  async function onSubmit(values: ResetPasswordInput) {
    const validation = resetPasswordSchema.safeParse(values);
    if (!validation.success) {
      const issue = validation.error.issues[0];
      const field = issue?.path[0] as keyof ResetPasswordInput | undefined;
      if (field) {
        form.setError(field, {
          message: issue?.message ?? "Check the form and try again.",
        });
      }
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateAccountPasswordAction(validation.data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Password updated.");
      form.reset({ password: "", confirmPassword: "" });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!form.formState.errors.password}
            {...form.register("password")}
          />
          {form.formState.errors.password ? (
            <p className="text-caption text-destructive">
              {form.formState.errors.password.message}
            </p>
          ) : (
            <p className="text-caption text-gray-400">
              At least 8 characters, with a letter and a number.
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!form.formState.errors.confirmPassword}
            {...form.register("confirmPassword")}
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-caption text-destructive">
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>
      <Button
        type="submit"
        variant="secondary"
        className="self-start"
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            Updating...
          </>
        ) : (
          "Update password"
        )}
      </Button>
    </form>
  );
}

export { SettingsPasswordForm };
