"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StageOption } from "@/types/profile";

/**
 * Startup stage picker. Same `startup_stages` table Sprint 2 already
 * introduced for investor preferences - see the Sprint 3 brief's
 * "structured foreign keys for... Startup stage" requirement.
 */
function StageSelect({
  options,
  value,
  onValueChange,
  disabled,
}: {
  options: StageOption[];
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
      <SelectTrigger aria-label="Stage">
        <SelectValue placeholder="Select a stage" />
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

export { StageSelect };
