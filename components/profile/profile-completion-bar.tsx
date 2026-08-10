import { cn } from "@/lib/utils";

/**
 * Simple completion bar - "Profile ████████░░ 80%" per the Sprint 2
 * brief. No animation library or chart dependency, just a styled div;
 * this is meant to be a quick glance, not a dashboard widget.
 */
function ProfileCompletionBar({
  percentage,
  label = "Profile completion",
  className,
}: {
  percentage: number;
  /** Screen-reader label for the progress bar - defaults to "Profile
   * completion" but overridable so this can be reused for the startup
   * completion bar (Sprint 3) without misdescribing it. */
  label?: string;
  className?: string;
}) {
  const clamped = Math.min(100, Math.max(0, percentage));

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="rounded-pill h-2 flex-1 overflow-hidden bg-gray-100"
      >
        <div
          className="rounded-pill bg-primary h-full transition-all"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="text-caption shrink-0 font-medium text-gray-500">
        {clamped}% complete
      </span>
    </div>
  );
}

export { ProfileCompletionBar };
