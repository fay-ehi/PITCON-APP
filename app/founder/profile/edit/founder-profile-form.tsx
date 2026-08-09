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
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { CountrySelect } from "@/components/profile/country-select";
import {
  founderProfileSchema,
  type FounderProfileInput,
} from "@/lib/validations/profile";
import { updateFounderProfileAction } from "@/lib/profile/founder-actions";
import type { FounderProfileDetail } from "@/types/profile";

/**
 * Edit form for the Founder's professional identity. Sections mirror the
 * Sprint 2 brief's grouping (Personal Information: name/photo/country;
 * Professional Information: job title/bio; Links: website).
 *
 * Reused as-is by onboarding (`app/founder/onboarding`) - the fields
 * collected there are identical, only the surrounding page chrome,
 * submit label, and post-save destination differ.
 */
function FounderProfileForm({
  profile,
  submitLabel = "Save changes",
  redirectTo = "/founder/profile",
  successMessage = "Profile updated successfully.",
}: {
  profile: FounderProfileDetail;
  submitLabel?: string;
  redirectTo?: string;
  successMessage?: string;
}) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = React.useState(profile.avatarUrl);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<FounderProfileInput>({
    resolver: zodResolver(founderProfileSchema),
    defaultValues: {
      fullName: profile.fullName,
      jobTitle: profile.jobTitle ?? "",
      country: profile.country ?? "",
      bio: profile.bio ?? "",
      websiteUrl: profile.websiteUrl ?? "",
    },
    mode: "onBlur",
  });

  // useWatch rather than form.watch() - form.watch() returns a function
  // React Compiler can't safely memoize (same reason the signup form
  // uses useWatch for its role field), so plain watch() calls get
  // silently skipped from memoization and can show stale values.
  const watchedFullName = useWatch({ control: form.control, name: "fullName" });
  const watchedCountry = useWatch({ control: form.control, name: "country" });

  async function onSubmit(values: FounderProfileInput) {
    setIsSubmitting(true);
    try {
      const result = await updateFounderProfileAction(values);
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
      router.push(redirectTo);
      router.refresh();
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
            <Label htmlFor="jobTitle">Job title</Label>
            <Input
              id="jobTitle"
              placeholder="Co-founder & CEO"
              aria-invalid={!!form.formState.errors.jobTitle}
              aria-describedby={
                form.formState.errors.jobTitle ? "jobTitle-error" : undefined
              }
              {...form.register("jobTitle")}
            />
            {form.formState.errors.jobTitle && (
              <p id="jobTitle-error" className="text-caption text-destructive">
                {form.formState.errors.jobTitle.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Short bio</Label>
            <Textarea
              id="bio"
              rows={4}
              placeholder="A couple of sentences about your background."
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
            <Label htmlFor="websiteUrl">LinkedIn / Website / Portfolio</Label>
            <Input
              id="websiteUrl"
              type="url"
              placeholder="https://linkedin.com/in/you"
              aria-invalid={!!form.formState.errors.websiteUrl}
              aria-describedby={
                form.formState.errors.websiteUrl
                  ? "websiteUrl-error"
                  : undefined
              }
              {...form.register("websiteUrl")}
            />
            {form.formState.errors.websiteUrl && (
              <p
                id="websiteUrl-error"
                className="text-caption text-destructive"
              >
                {form.formState.errors.websiteUrl.message}
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

export { FounderProfileForm };
