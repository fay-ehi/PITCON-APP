"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CountrySelect } from "@/components/profile/country-select";
import { IndustrySelect } from "@/components/startup/industry-select";
import { StageSelect } from "@/components/startup/stage-select";
import { LogoUpload } from "@/components/startup/logo-upload";
import { CoverUpload } from "@/components/startup/cover-upload";
import { PitchDeckUpload } from "@/components/startup/pitch-deck-upload";
import { StartupMiniPreview } from "@/components/startup/startup-mini-preview";
import { PublishDialog } from "@/components/startup/publish-dialog";
import { ProfileCompletionBar } from "@/components/profile/profile-completion-bar";
import {
  parseStartupNumberInput,
  parseStartupTextInput,
  startupSaveSchema,
  type StartupSaveInput,
} from "@/lib/validations/startup";
import {
  publishStartupAction,
  saveStartupAction,
} from "@/lib/startup/startup-actions";
import {
  calculateStartupCompletion,
  getMissingPublishFields,
} from "@/lib/startup/completion";
import type { IndustryOption, StageOption } from "@/types/profile";
import type { StartupDetail, StartupFormFields } from "@/types/startup";

/** The RHF form's own value shape - every field a plain string (what
 * `<input>`/`<Select>` naturally produce), including the numeric ones.
 * Deliberately NOT `StartupSaveInput` directly: that schema's fields are
 * `number | null` / `string | null` (the *normalized* payload sent to
 * the server), and fighting a resolver to reconcile raw string inputs
 * against a nullable-number schema is exactly what
 * `investor-preferences-form.tsx` already found not worth it for this
 * shape of form - see that file's comment. Same call here, just for a
 * bigger form: plain `useState`-backed strings, normalized by hand at
 * submit time via `parseStartupTextInput` / `parseStartupNumberInput`.
 */
type StartupFormValues = {
  name: string;
  tagline: string;
  description: string;
  industryId: string;
  stageId: string;
  country: string;
  city: string;
  websiteUrl: string;
  fundingAmountSought: string;
  annualRevenue: string;
  monthlyRevenue: string;
  customerCount: string;
  employeeCount: string;
  elevatorPitch: string;
  linkedinUrl: string;
  twitterUrl: string;
  instagramUrl: string;
};

function toFormValues(startup: StartupDetail): StartupFormValues {
  return {
    name: startup.name ?? "",
    tagline: startup.tagline ?? "",
    description: startup.description ?? "",
    industryId: startup.industryId ?? "",
    stageId: startup.stageId ?? "",
    country: startup.country ?? "",
    city: startup.city ?? "",
    websiteUrl: startup.websiteUrl ?? "",
    fundingAmountSought: startup.fundingAmountSought?.toString() ?? "",
    annualRevenue: startup.annualRevenue?.toString() ?? "",
    monthlyRevenue: startup.monthlyRevenue?.toString() ?? "",
    customerCount: startup.customerCount?.toString() ?? "",
    employeeCount: startup.employeeCount?.toString() ?? "",
    elevatorPitch: startup.elevatorPitch ?? "",
    linkedinUrl: startup.linkedinUrl ?? "",
    twitterUrl: startup.twitterUrl ?? "",
    instagramUrl: startup.instagramUrl ?? "",
  };
}

/** Normalizes the raw string form values into the nullable payload
 * `startupSaveSchema` validates, surfacing the first parse error (a bad
 * number, mainly - text fields can't fail this step, only zod's own
 * length/format checks after) the same way the investor preferences
 * form's `parseAmountInput` does. */
function normalize(
  values: StartupFormValues,
):
  | { data: StartupSaveInput; error?: undefined }
  | { data?: undefined; error: string; field: keyof StartupFormValues } {
  const funding = parseStartupNumberInput(values.fundingAmountSought);
  if (funding.error)
    return { error: funding.error, field: "fundingAmountSought" };
  const annual = parseStartupNumberInput(values.annualRevenue);
  if (annual.error) return { error: annual.error, field: "annualRevenue" };
  const monthly = parseStartupNumberInput(values.monthlyRevenue);
  if (monthly.error) return { error: monthly.error, field: "monthlyRevenue" };
  const customers = parseStartupNumberInput(values.customerCount, {
    integer: true,
  });
  if (customers.error)
    return { error: customers.error, field: "customerCount" };
  const employees = parseStartupNumberInput(values.employeeCount, {
    integer: true,
  });
  if (employees.error)
    return { error: employees.error, field: "employeeCount" };

  return {
    data: {
      name: parseStartupTextInput(values.name),
      tagline: parseStartupTextInput(values.tagline),
      description: parseStartupTextInput(values.description),
      industryId: values.industryId || null,
      stageId: values.stageId || null,
      country: values.country || null,
      city: parseStartupTextInput(values.city),
      websiteUrl: parseStartupTextInput(values.websiteUrl),
      fundingAmountSought: funding.value ?? null,
      annualRevenue: annual.value ?? null,
      monthlyRevenue: monthly.value ?? null,
      customerCount: customers.value ?? null,
      employeeCount: employees.value ?? null,
      elevatorPitch: parseStartupTextInput(values.elevatorPitch),
      linkedinUrl: parseStartupTextInput(values.linkedinUrl),
      twitterUrl: parseStartupTextInput(values.twitterUrl),
      instagramUrl: parseStartupTextInput(values.instagramUrl),
    },
  };
}

/**
 * The Sprint 3 create/edit form, now addressed by `startup.id` rather
 * than being the founder's one implicit startup - `startup` is always a
 * real row (see `createDraftStartupAction`, which is the only place a
 * startup row is ever created; by the time this form renders, one
 * already exists, blank or not). Every server call that used to be
 * "for whichever startup this founder has" is now "for
 * `startup.id`" - `saveStartupAction`, `publishStartupAction`, and the
 * asset actions reached via `LogoUpload`/`CoverUpload`/`PitchDeckUpload`
 * all take it explicitly.
 */
function StartupForm({
  startup,
  industries,
  stages,
}: {
  startup: StartupDetail;
  industries: IndustryOption[];
  stages: StageOption[];
}) {
  const router = useRouter();
  const isPublished = startup.status === "published";

  const [logoUrl, setLogoUrl] = React.useState(startup.logoUrl);
  const [coverImageUrl, setCoverImageUrl] = React.useState(
    startup.coverImageUrl,
  );
  const [pitchDeckPath, setPitchDeckPath] = React.useState(
    startup.pitchDeckPath,
  );
  const [pitchDeckOriginalName, setPitchDeckOriginalName] = React.useState(
    startup.pitchDeckOriginalName,
  );

  const [isSaving, setIsSaving] = React.useState(false);
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const form = useForm<StartupFormValues>({
    defaultValues: toFormValues(startup),
    mode: "onBlur",
  });

  // useWatch, not form.watch() - see founder-profile-form.tsx's comment
  // on why (React Compiler memoization).
  const watched = useWatch({ control: form.control });

  const currentFields: StartupFormFields = React.useMemo(
    () => ({
      name: watched.name || null,
      logoUrl,
      coverImageUrl,
      tagline: watched.tagline || null,
      description: watched.description || null,
      industryId: watched.industryId || null,
      stageId: watched.stageId || null,
      country: watched.country || null,
      city: watched.city || null,
      websiteUrl: watched.websiteUrl || null,
      fundingAmountSought: watched.fundingAmountSought
        ? Number(watched.fundingAmountSought)
        : null,
      annualRevenue: watched.annualRevenue
        ? Number(watched.annualRevenue)
        : null,
      monthlyRevenue: watched.monthlyRevenue
        ? Number(watched.monthlyRevenue)
        : null,
      customerCount: watched.customerCount
        ? Number(watched.customerCount)
        : null,
      employeeCount: watched.employeeCount
        ? Number(watched.employeeCount)
        : null,
      pitchDeckPath,
      pitchDeckOriginalName,
      elevatorPitch: watched.elevatorPitch || null,
      linkedinUrl: watched.linkedinUrl || null,
      twitterUrl: watched.twitterUrl || null,
      instagramUrl: watched.instagramUrl || null,
    }),
    [watched, logoUrl, coverImageUrl, pitchDeckPath, pitchDeckOriginalName],
  );

  const completion = calculateStartupCompletion(currentFields);
  const missingFields = getMissingPublishFields(currentFields);
  const selectedIndustry = industries.find((i) => i.id === watched.industryId);
  const selectedStage = stages.find((s) => s.id === watched.stageId);

  async function performSave(values: StartupFormValues): Promise<boolean> {
    const normalized = normalize(values);
    if (normalized.error) {
      form.setError(normalized.field, { message: normalized.error });
      return false;
    }

    const validation = startupSaveSchema.safeParse(normalized.data);
    if (!validation.success) {
      const issue = validation.error.issues[0];
      const field = issue?.path[0] as keyof StartupFormValues | undefined;
      if (field && field in form.getValues()) {
        form.setError(field, {
          message: issue?.message ?? "Check the form and try again.",
        });
      } else {
        setFormError(issue?.message ?? "Check the form and try again.");
      }
      return false;
    }

    const result = await saveStartupAction(startup.id, validation.data);
    if (!result.success) {
      if (result.field && result.field in form.getValues()) {
        form.setError(result.field as keyof StartupFormValues, {
          message: result.error,
        });
      } else {
        setFormError(result.error);
      }
      return false;
    }
    return true;
  }

  async function handleSaveDraft(values: StartupFormValues) {
    setFormError(null);
    setIsSaving(true);
    try {
      const saved = await performSave(values);
      if (saved) {
        toast.success("Draft saved.");
        router.refresh();
      }
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePublishConfirm() {
    setIsPublishing(true);
    setFormError(null);
    try {
      const saved = await performSave(form.getValues());
      if (!saved) {
        setPublishDialogOpen(false);
        return;
      }

      const result = await publishStartupAction(startup.id);
      if (!result.success) {
        toast.error(result.error);
        setPublishDialogOpen(false);
        return;
      }

      toast.success("Your startup is now published.");
      setPublishDialogOpen(false);
      router.push(`/founder/startups/${startup.id}`);
      router.refresh();
    } catch {
      setFormError("Something went wrong. Please try again.");
      setPublishDialogOpen(false);
    } finally {
      setIsPublishing(false);
    }
  }

  const busy = isSaving || isPublishing;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <form
        onSubmit={form.handleSubmit(handleSaveDraft)}
        noValidate
        className="flex flex-col gap-6"
      >
        {/* Completion + status inline, visible on every breakpoint - the
            sticky sidebar version (below) is desktop-only, per the
            Sprint 3 brief's "mobile should intentionally reorganize
            rather than simply compressing." */}
        <div className="lg:hidden">
          <ProfileCompletionBar
            percentage={completion}
            label="Startup completion"
          />
        </div>

        {isPublished && (
          <p className="text-caption bg-primary-50 text-primary-700 rounded-card px-4 py-2.5">
            This startup is published. Changes save immediately and stay live -
            clearing a required field isn&apos;t allowed while published.
          </p>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Company</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="space-y-2">
              <Label>Logo</Label>
              <LogoUpload
                startupId={startup.id}
                logoUrl={logoUrl}
                onChange={setLogoUrl}
              />
            </div>

            <div className="space-y-2">
              <Label>Cover image</Label>
              <CoverUpload
                startupId={startup.id}
                coverImageUrl={coverImageUrl}
                onChange={setCoverImageUrl}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Startup name</Label>
              <Input
                id="name"
                placeholder="Acme Inc."
                aria-invalid={!!form.formState.errors.name}
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-caption text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                placeholder="A one-line summary of what you do"
                aria-invalid={!!form.formState.errors.tagline}
                {...form.register("tagline")}
              />
              {form.formState.errors.tagline && (
                <p className="text-caption text-destructive">
                  {form.formState.errors.tagline.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Industry</Label>
                <IndustrySelect
                  options={industries}
                  value={watched.industryId ?? ""}
                  onValueChange={(value) =>
                    form.setValue("industryId", value, { shouldValidate: true })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Stage</Label>
                <StageSelect
                  options={stages}
                  value={watched.stageId ?? ""}
                  onValueChange={(value) =>
                    form.setValue("stageId", value, { shouldValidate: true })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Country</Label>
                <CountrySelect
                  value={watched.country ?? ""}
                  onValueChange={(value) =>
                    form.setValue("country", value, { shouldValidate: true })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Lagos"
                  aria-invalid={!!form.formState.errors.city}
                  {...form.register("city")}
                />
                {form.formState.errors.city && (
                  <p className="text-caption text-destructive">
                    {form.formState.errors.city.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website</Label>
              <Input
                id="websiteUrl"
                type="url"
                placeholder="https://acme.com"
                aria-invalid={!!form.formState.errors.websiteUrl}
                {...form.register("websiteUrl")}
              />
              {form.formState.errors.websiteUrl && (
                <p className="text-caption text-destructive">
                  {form.formState.errors.websiteUrl.message}
                </p>
              )}
              <p className="text-caption text-gray-400">Optional.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={5}
                placeholder="What does your startup do, and for whom?"
                aria-invalid={!!form.formState.errors.description}
                {...form.register("description")}
              />
              {form.formState.errors.description ? (
                <p className="text-caption text-destructive">
                  {form.formState.errors.description.message}
                </p>
              ) : (
                <p className="text-caption text-gray-400">
                  Up to 2000 characters.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Funding &amp; traction</CardTitle>
            <CardDescription>
              Enough for an investor to gauge where you are - not a full
              financial report.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fundingAmountSought">Funding sought (USD)</Label>
              <Input
                id="fundingAmountSought"
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="e.g. 250000"
                aria-invalid={!!form.formState.errors.fundingAmountSought}
                {...form.register("fundingAmountSought")}
              />
              {form.formState.errors.fundingAmountSought && (
                <p className="text-caption text-destructive">
                  {form.formState.errors.fundingAmountSought.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeCount">Number of employees</Label>
              <Input
                id="employeeCount"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                placeholder="e.g. 6"
                aria-invalid={!!form.formState.errors.employeeCount}
                {...form.register("employeeCount")}
              />
              {form.formState.errors.employeeCount && (
                <p className="text-caption text-destructive">
                  {form.formState.errors.employeeCount.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerCount">Number of customers/users</Label>
              <Input
                id="customerCount"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                placeholder="e.g. 1200"
                aria-invalid={!!form.formState.errors.customerCount}
                {...form.register("customerCount")}
              />
              {form.formState.errors.customerCount && (
                <p className="text-caption text-destructive">
                  {form.formState.errors.customerCount.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="annualRevenue">Annual revenue (USD)</Label>
              <Input
                id="annualRevenue"
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="e.g. 50000"
                aria-invalid={!!form.formState.errors.annualRevenue}
                {...form.register("annualRevenue")}
              />
              {form.formState.errors.annualRevenue ? (
                <p className="text-caption text-destructive">
                  {form.formState.errors.annualRevenue.message}
                </p>
              ) : (
                <p className="text-caption text-gray-400">Optional.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyRevenue">Monthly revenue (USD)</Label>
              <Input
                id="monthlyRevenue"
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="e.g. 4000"
                aria-invalid={!!form.formState.errors.monthlyRevenue}
                {...form.register("monthlyRevenue")}
              />
              {form.formState.errors.monthlyRevenue ? (
                <p className="text-caption text-destructive">
                  {form.formState.errors.monthlyRevenue.message}
                </p>
              ) : (
                <p className="text-caption text-gray-400">Optional.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pitch</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="space-y-2">
              <Label>Pitch deck</Label>
              <PitchDeckUpload
                startupId={startup.id}
                pitchDeckPath={pitchDeckPath}
                pitchDeckOriginalName={pitchDeckOriginalName}
                onChange={({ path, originalName }) => {
                  setPitchDeckPath(path);
                  setPitchDeckOriginalName(originalName);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="elevatorPitch">One-minute elevator pitch</Label>
              <Textarea
                id="elevatorPitch"
                rows={4}
                placeholder="If you had sixty seconds with an investor, what would you say?"
                aria-invalid={!!form.formState.errors.elevatorPitch}
                {...form.register("elevatorPitch")}
              />
              {form.formState.errors.elevatorPitch ? (
                <p className="text-caption text-destructive">
                  {form.formState.errors.elevatorPitch.message}
                </p>
              ) : (
                <p className="text-caption text-gray-400">
                  Up to 600 characters.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Social links</CardTitle>
            <CardDescription>Optional.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn</Label>
              <Input
                id="linkedinUrl"
                type="url"
                placeholder="https://linkedin.com/company/..."
                aria-invalid={!!form.formState.errors.linkedinUrl}
                {...form.register("linkedinUrl")}
              />
              {form.formState.errors.linkedinUrl && (
                <p className="text-caption text-destructive">
                  {form.formState.errors.linkedinUrl.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitterUrl">X (Twitter)</Label>
              <Input
                id="twitterUrl"
                type="url"
                placeholder="https://x.com/..."
                aria-invalid={!!form.formState.errors.twitterUrl}
                {...form.register("twitterUrl")}
              />
              {form.formState.errors.twitterUrl && (
                <p className="text-caption text-destructive">
                  {form.formState.errors.twitterUrl.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagramUrl">Instagram</Label>
              <Input
                id="instagramUrl"
                type="url"
                placeholder="https://instagram.com/..."
                aria-invalid={!!form.formState.errors.instagramUrl}
                {...form.register("instagramUrl")}
              />
              {form.formState.errors.instagramUrl && (
                <p className="text-caption text-destructive">
                  {form.formState.errors.instagramUrl.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {formError && (
          <p className="text-caption text-destructive" role="alert">
            {formError}
          </p>
        )}

        {/* Sticky action bar - per the Sprint 3 brief's section 19,
            "sticky action area where useful" for the mobile/tablet
            layout. On desktop this just sits at the end of the form. */}
        <div className="border-border sticky bottom-0 -mx-4 flex justify-end gap-3 border-t bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          <Button type="submit" variant="secondary" disabled={busy}>
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" aria-hidden />
                Saving...
              </>
            ) : (
              "Save Draft"
            )}
          </Button>
          <Button
            type="button"
            disabled={busy}
            onClick={() => setPublishDialogOpen(true)}
          >
            Publish
          </Button>
        </div>
      </form>

      {/* Desktop-only preview/progress sidebar - Sprint 3 brief section
          19's "Form | Preview / Progress" split. */}
      <aside className="hidden lg:block">
        <div className="sticky top-6 flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-small">Startup completion</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ProfileCompletionBar
                percentage={completion}
                label="Startup completion"
              />
              {missingFields.length > 0 && (
                <p className="text-caption text-gray-500">
                  {missingFields.length} field
                  {missingFields.length === 1 ? "" : "s"} left before you can
                  publish.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-small">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <StartupMiniPreview
                name={watched.name ?? ""}
                tagline={watched.tagline ?? ""}
                logoUrl={logoUrl}
                industryName={selectedIndustry?.name ?? null}
                stageName={selectedStage?.name ?? null}
                fundingAmountSought={currentFields.fundingAmountSought}
              />
            </CardContent>
          </Card>
        </div>
      </aside>

      <PublishDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        missingFields={missingFields}
        isPublishing={isPublishing}
        onConfirm={handlePublishConfirm}
      />
    </div>
  );
}

export { StartupForm };
