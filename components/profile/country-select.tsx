"use client";

import { COUNTRIES } from "@/constants/countries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Country picker shared by the Founder and Investor forms. Radix
 * `Select` supports type-ahead out of the box (typing "N" then "i" jumps
 * to "Nigeria"), which is enough to navigate a ~195-item list without
 * pulling in a combobox/command-palette dependency the rest of the app
 * doesn't otherwise need.
 */
function CountrySelect({
  value,
  onValueChange,
  disabled,
}: {
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
      <SelectTrigger aria-label="Country">
        <SelectValue placeholder="Select your country" />
      </SelectTrigger>
      <SelectContent>
        {COUNTRIES.map((country) => (
          <SelectItem key={country} value={country}>
            {country}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { CountrySelect };
