"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IndustryOption } from "@/types/profile";

/**
 * Industry picker for the startup form. Same `industries` table Sprint
 * 2 already introduced for investor preferences - a startup's industry
 * and an investor's preferred industries are the same taxonomy, per the
 * Sprint 3 brief's "use structured foreign keys... do not store
 * controlled categories as arbitrary free-text values."
 */
function IndustrySelect({
  options,
  value,
  onValueChange,
  disabled,
}: {
  options: IndustryOption[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <Select
      value={value || undefined}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger aria-label="Industry">
        <SelectValue placeholder="Select an industry" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {option.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { IndustrySelect };
