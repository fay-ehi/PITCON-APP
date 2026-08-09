"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { CountrySelect } from "@/components/profile/country-select";
import { INVESTOR_TYPES } from "@/constants/investor-types";
import {
  investorProfileSchema,
  type InvestorProfileInput,
} from "@/lib/validations/profile";
import { updateInvestorProfileAction } from "@/lib/profile/investor-actions";
import type { InvestorProfileDetail } from "@/types/profile";

/**
 * Edit form for the Investor's professional identity (name, photo,
 * organization, country, investor type, bio, LinkedIn). Investment
 * preferences are a separate card/form
 * (`investor-preferences-form.tsx`) - they're saved through a different
 * action (the `replace_investor_preferences` RPC) and have their own
 * multi-select UI, so splitting them keeps each form's submit handler
 * doing one clear thing.
 *
 * Reused as-is by onboarding (`app/investor/onboarding`), same rationale
 * as the founder form.
 */
function InvestorProfileForm({
  profile,
  submitLabel = "Save changes",
  redirectTo,
  successMessage = "Profile updated successfully.",
}: {
  profile: InvestorProfileDetail;
  submitLabel?: string;
  redirectTo?: string;
  successMessage?: string;
}) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = React.useState(profile.avatarUrl);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<InvestorProfileInput>({
    resolver: zodResolver(investorProfileSchema),
    defaultValues: {
      fullName: profile.fullName,
      organization: profile.organization ?? "",
      country: profile.country ?? "",
      investorType: profile.investorType ?? undefined,
      bio: profile.bio ?? "",
      linkedinUrl: profile.linkedinUrl ?? "",
    },
    mode: "onBlur",
  });

  // useWatch rather than form.watch() - see the founder form for why.
  const watchedFullName = useWatch({ control: form.control, name: "fullName" });
  const watchedCountry = useWatch({ control: form.control, name: "country" });
  const watchedInvestorType = useWatch({
    control: form.control,
    name: "investorType",
  });

  async function onSubmit(values: InvestorProfileInput) {
    setIsSubmitting(true);
    try {
      const result = await updateInvestorProfileAction(values);
      if (!result.success) {
        setIsSubmitting(false);
        if (result.field) {
          form.setError(result.field, { message: result.error });
        } else {
          toast.error(result.error);
        }
        return;
      }
      toast.success(successMessage);
      if (redirectTo) {
        router.push(redirectTo);
      }
      router.refresh();
      setIsSubmitting(false);
    } catch {
      setIsSubmitting(false);
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="space-y-2">
            <Label>Photo</Label>
            <AvatarUpload
              name={watchedFullName || profile.fullName}
              avatarUrl={avatarUrl}
              onChange={setAvatarUrl}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              autoComplete="name"
              aria-invalid={!!form.formState.errors.fullName}
              aria-describedby={
                form.formState.errors.fullName ? "fullName-error" : undefined
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
            <Label htmlFor="country">Country</Label>
            <CountrySelect
              value={watchedCountry}
              onValueChange={(value) =>
                form.setValue("country", value, { shouldValidate: true })
              }
            />
            {form.formState.errors.country && (
              <p className="text-caption text-destructive">
                {form.formState.errors.country.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Professional information</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="space-y-2">
            <Label htmlFor="organization">Organization</Label>
            <Input
              id="organization"
              placeholder="Acme Ventures"
              aria-invalid={!!form.formState.errors.organization}
              aria-describedby={
                form.formState.errors.organization
                  ? "organization-error"
                  : undefined
              }
              {...form.register("organization")}
            />
            {form.formState.errors.organization && (
              <p
                id="organization-error"
                className="text-caption text-destructive"
              >
                {form.formState.errors.organization.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="investorType">Investor type</Label>
            <Select
              value={watchedInvestorType}
              onValueChange={(value) =>
                form.setValue(
                  "investorType",
                  value as InvestorProfileInput["investorType"],
                  { shouldValidate: true },
                )
              }
            >
              <SelectTrigger id="investorType" aria-label="Investor type">
                <SelectValue placeholder="Select an investor type" />
              </SelectTrigger>
              <SelectContent>
                {INVESTOR_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.investorType && (
              <p className="text-caption text-destructive">
                {form.formState.errors.investorType.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={4}
              placeholder="What you invest in and why."
              aria-invalid={!!form.formState.errors.bio}
              aria-describedby={
                form.formState.errors.bio ? "bio-error" : "bio-hint"
              }
              {...form.register("bio")}
            />
            {form.formState.errors.bio ? (
              <p id="bio-error" className="text-caption text-destructive">
                {form.formState.errors.bio.message}
              </p>
            ) : (
              <p id="bio-hint" className="text-caption text-gray-400">
                Optional, up to 500 characters.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="linkedinUrl">LinkedIn</Label>
            <Input
              id="linkedinUrl"
              type="url"
              placeholder="https://linkedin.com/in/you"
              aria-invalid={!!form.formState.errors.linkedinUrl}
              aria-describedby={
                form.formState.errors.linkedinUrl
                  ? "linkedinUrl-error"
                  : undefined
              }
              {...form.register("linkedinUrl")}
            />
            {form.formState.errors.linkedinUrl && (
              <p
                id="linkedinUrl-error"
                className="text-caption text-destructive"
              >
                {form.formState.errors.linkedinUrl.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" aria-hidden />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}

export { InvestorProfileForm };
