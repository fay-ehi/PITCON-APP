import { BadgeCheck } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Sprint 13 (Verified Badges). A small, deliberately unobtrusive
 * checkmark - not a pill/label with the word "Verified" spelled out
 * everywhere, since it sits inline next to a name in tight spaces
 * (result cards, interest rows, message headers) where a text badge
 * would compete with the name itself. `title` (a native browser
 * tooltip) carries the actual word "Verified" for anyone who hovers or
 * uses a screen reader that surfaces title text - no new Tooltip
 * primitive added just for this one component.
 *
 * Renders nothing at all when `verified` is false - callers pass this
 * unconditionally (`<VerifiedBadge verified={x.verified} />`) rather
 * than wrapping every call site in its own `{x.verified && ...}`.
 */
function VerifiedBadge({
  verified,
  className,
}: {
  verified: boolean;
  className?: string;
}) {
  if (!verified) return null;

  return (
    <BadgeCheck
      className={cn("size-4 shrink-0 fill-primary text-white", className)}
      aria-label="Verified"
      role="img"
    />
  );
}

export { VerifiedBadge };
