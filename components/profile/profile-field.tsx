import type * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** A single label/value row on a profile view page. Renders a muted
 * "Not added yet" placeholder instead of an empty gap when a field
 * hasn't been filled in yet - keeps optional fields from looking broken
 * without implying they're required.
 *
 * `icon` is optional - when passed, the field renders as an icon-led
 * row (used by the profile "at a glance" summary card) instead of the
 * plain stacked label/value block every other caller already relies
 * on, so existing usages are unaffected. */
function ProfileField({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
}) {
  const isEmpty = value === null || value === undefined || value === "";
  const valueNode = isEmpty ? (
    <span className="text-body text-gray-400 italic">Not added yet</span>
  ) : (
    <span className="text-body text-gray-900">{value}</span>
  );

  if (Icon) {
    return (
      <div className={cn("flex items-start gap-3", className)}>
        <span className="bg-primary-50 flex size-9 shrink-0 items-center justify-center rounded-full">
          <Icon className="text-primary size-4" aria-hidden />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5 pt-0.5">
          <span className="text-caption font-medium text-gray-500">{label}</span>
          {valueNode}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-caption font-medium text-gray-500">{label}</span>
      {valueNode}
    </div>
  );
}

export { ProfileField };
