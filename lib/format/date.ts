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

/**
 * A single message bubble's timestamp - Sprint 7. "10:42 AM" for
 * anything sent today, a short date otherwise. Deliberately not
 * relative like `formatRelativeDate`: a fixed clock time doesn't keep
 * changing/re-rendering while a conversation just sits open, which
 * matters more here than in a notification feed.
 */
export function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

/**
 * Sprint 7's conversation list timestamp - "2m" / "3h" / "5d", matching
 * the brief's "CONVERSATION LIST" mockup exactly. Distinct from
 * `formatRelativeDate`'s "5 minutes ago": a list row needs the shortest
 * form that still reads unambiguously, since it sits at the end of an
 * already-busy row alongside a startup name, a participant name, and a
 * message preview.
 */
export function formatShortRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Math.max(0, Date.now() - date.getTime());

  const minutes = Math.floor(diffMs / MINUTE);
  const hours = Math.floor(diffMs / HOUR);
  const days = Math.floor(diffMs / DAY);

  if (minutes < 1) return "Now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}
