/**
 * Relative-time formatting shared across Sprint 6's Interests and
 * Notifications lists ("Date interest was submitted" / notification
 * timestamps) - the first place in PITCON three different features need
 * the same date formatting, so unlike `lib/startup/format.ts`'s
 * single-reuse `formatUsd`/`formatCount`, this earns its own small
 * shared module rather than being duplicated per feature.
 */

const RTF = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

/** "Just now" / "5 minutes ago" / "3 hours ago" / "2 days ago" for
 * anything within the last week, falling back to a plain short date
 * (e.g. "Jun 12, 2026") beyond that - matches the brief's "Submitted
 * recently" mockup without ever showing a stale-looking relative time
 * for something months old. */
export function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const diffMs = date.getTime() - Date.now();
  const absMs = Math.abs(diffMs);

  if (absMs < MINUTE) return "Just now";
  if (absMs < HOUR) return RTF.format(Math.round(diffMs / MINUTE), "minute");
  if (absMs < DAY) return RTF.format(Math.round(diffMs / HOUR), "hour");
  if (absMs < WEEK) return RTF.format(Math.round(diffMs / DAY), "day");

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
