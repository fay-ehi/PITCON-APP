import type * as React from "react";

import { cn } from "@/lib/utils";

/** A single label/value row on a profile view page. Renders a muted
 * "Not added yet" placeholder instead of an empty gap when a field
 * hasn't been filled in yet - keeps optional fields from looking broken
 * without implying they're required. */
function ProfileField({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  const isEmpty = value === null || value === undefined || value === "";

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-caption font-medium text-gray-500">{label}</span>
      {isEmpty ? (
        <span className="text-body text-gray-400 italic">Not added yet</span>
      ) : (
        <span className="text-body text-gray-900">{value}</span>
      )}
    </div>
  );
}

export { ProfileField };
