"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChipMultiSelect } from "@/components/profile/chip-multi-select";
import {
  investorPreferencesSchema,
  parseAmountInput,
} from "@/lib/validations/profile";
import { updateInvestorPreferencesAction } from "@/lib/profile/investor-actions";
import type { IndustryOption, StageOption } from "@/types/profile";

/**
 * Industries, startup stages, and funding range - kept as its own card
 * and its own submit action (`updateInvestorPreferencesAction`, backed
 * by the `replace_investor_preferences` RPC) separate from
 * `InvestorProfileForm`. Not built on `react-hook-form`: this form is
 * two chip-toggle groups plus two number inputs, not a text-heavy form,
 * so plain `useState` plus a manual `investorPreferencesSchema.safeParse`
 * on submit is simpler than fighting a resolver's input/output typing for
 * the amount fields' string-to-number conversion.
 */
function InvestorPreferencesForm({
  industries,
  stages,
  initialIndustryIds,
  initialStageIds,
  initialFundingRangeMin,
  initialFundingRangeMax,
}: {
  industries: IndustryOption[];
  stages: StageOption[];
  initialIndustryIds: string[];
  initialStageIds: string[];
  initialFundingRangeMin: number | null;
  initialFundingRangeMax: number | null;
}) {
  const router = useRouter();
  const [industryIds, setIndustryIds] = React.useState(initialIndustryIds);
  const [stageIds, setStageIds] = React.useState(initialStageIds);
  const [fundingRangeMin, setFundingRangeMin] = React.useState(
    initialFundingRangeMin !== null ? String(initialFundingRangeMin) : "",
  );
  const [fundingRangeMax, setFundingRangeMax] = React.useState(
    initialFundingRangeMax !== null ? String(initialFundingRangeMax) : "",
  );
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const min = parseAmountInput(fundingRangeMin);
    if (min.error) {
      setError(`Minimum funding: ${min.error}`);
      return;
    }
    const max = parseAmountInput(fundingRangeMax);
    if (max.error) {
      setError(`Maximum funding: ${max.error}`);
      return;
    }

    const payload = {
      industryIds,
      stageIds,
      fundingRangeMin: min.value ?? null,
      fundingRangeMax: max.value ?? null,
    };

    const validation = investorPreferencesSchema.safeParse(payload);
    if (!validation.success) {
      setError(
        validation.error.issues[0]?.message ??
          "Check your preferences and try again.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateInvestorPreferencesAction(validation.data);
      if (!result.success) {
        setError(result.error);
        return;
      }
      toast.success("Preferences updated successfully.");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Investment preferences</CardTitle>
          <CardDescription>
            Optional, but helps investors show up in the right place once
            Discover ships.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="space-y-2">
            <Label>Industries</Label>
            <ChipMultiSelect
              options={industries}
              value={industryIds}
              onChange={setIndustryIds}
              aria-label="Preferred industries"
            />
          </div>

          <div className="space-y-2">
            <Label>Startup stages</Label>
            <ChipMultiSelect
              options={stages}
              value={stageIds}
              onChange={setStageIds}
              aria-label="Preferred startup stages"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fundingRangeMin">Minimum investment (USD)</Label>
              <Input
                id="fundingRangeMin"
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="e.g. 10000"
                value={fundingRangeMin}
                onChange={(e) => setFundingRangeMin(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fundingRangeMax">Maximum investment (USD)</Label>
              <Input
                id="fundingRangeMax"
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="e.g. 250000"
                value={fundingRangeMax}
                onChange={(e) => setFundingRangeMax(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-caption text-destructive">{error}</p>}

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden />
                  Saving...
                </>
              ) : (
                "Save preferences"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

export { InvestorPreferencesForm };
