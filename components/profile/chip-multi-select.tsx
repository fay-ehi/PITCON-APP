"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export type ChipOption = { id: string; name: string };

/**
 * Toggleable chip group for picking several industries or startup
 * stages. A plain button grid rather than a shadcn Checkbox list (no
 * checkbox primitive is installed, and chips read better than a long
 * vertical checkbox stack for ~7–17 short options) or a Select (Radix
 * Select is single-value; industries/stages are multi-select).
 */
function ChipMultiSelect({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
  className,
}: {
  options: ChipOption[];
  value: string[];
  onChange: (next: string[]) => void;
  "aria-label": string;
  className?: string;
}) {
  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn("flex flex-wrap gap-2", className)}
    >
      {options.map((option) => {
        const selected = value.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            onClick={() => toggle(option.id)}
            className={cn(
              "rounded-pill text-small inline-flex items-center gap-1.5 border px-3 py-1.5 font-medium transition-colors",
              selected
                ? "bg-primary-50 text-primary-700 border-transparent"
                : "border-border bg-white text-gray-700 hover:bg-gray-50",
            )}
          >
            {selected && <Check className="size-3.5" aria-hidden />}
            {option.name}
          </button>
        );
      })}
    </div>
  );
}

export { ChipMultiSelect };
