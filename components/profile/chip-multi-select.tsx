"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { getIndustryAccent } from "@/lib/startup/industry-accent";

export type ChipOption = { id: string; name: string; slug?: string };

/**
 * Toggleable chip group for picking several industries or startup
 * stages. A plain button grid rather than a shadcn Checkbox list (no
 * checkbox primitive is installed, and chips read better than a long
 * vertical checkbox stack for ~7–17 short options) or a Select (Radix
 * Select is single-value; industries/stages are multi-select).
 *
 * `colorize` opts a group into the same per-industry accent colour used
 * everywhere else an industry is shown (My Startups, Discover, the
 * profile view page's preference chips) - only meaningful when every
 * option carries a `slug` (i.e. industries, not stages, which have no
 * accent mapping and keep the plain neutral/primary toggle look).
 */
function ChipMultiSelect({
  options,
  value,
  onChange,
  colorize = false,
  "aria-label": ariaLabel,
  className,
}: {
  options: ChipOption[];
  value: string[];
  onChange: (next: string[]) => void;
  colorize?: boolean;
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
        const accent = colorize ? getIndustryAccent(option.slug) : null;
        const Icon = accent?.icon;

        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            onClick={() => toggle(option.id)}
            className={cn(
              "rounded-pill text-small inline-flex items-center gap-1.5 border px-3 py-1.5 font-medium transition-colors",
              accent
                ? selected
                  ? cn(accent.solidBg, accent.solidText, "border-transparent")
                  : cn(accent.softBg, accent.softText, "border-transparent hover:opacity-80")
                : selected
                  ? "bg-primary-50 text-primary-700 border-transparent"
                  : "border-border bg-white text-gray-700 hover:bg-gray-50",
            )}
          >
            {accent && Icon ? (
              <Icon className="size-3.5" aria-hidden />
            ) : (
              selected && <Check className="size-3.5" aria-hidden />
            )}
            {option.name}
          </button>
        );
      })}
    </div>
  );
}

export { ChipMultiSelect };
