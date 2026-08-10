import { cn } from "@/lib/utils";

/**
 * The small decorative visual the Sprint 4 brief asks for in the lower
 * right of the My Startups workspace - "SVG / small animation / abstract
 * visual / dashboard-related symbol... small, elegant, subtle,
 * non-distracting... does not look like a random stock illustration."
 *
 * Abstract on purpose (concentric orbit rings + a few satellite dots
 * and a small upward chevron) rather than a literal illustration, so it
 * can't compete with real startup logos/content on the page. Purely
 * decorative (`aria-hidden`, no text content), so it's invisible to
 * assistive tech. The float animation is defined in globals.css and
 * only ever applies under `prefers-reduced-motion: no-preference` -
 * with reduced motion requested, this renders as a fully static SVG.
 */
function MyStartupsDecoration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden="true"
      focusable="false"
      className={cn("text-primary-500 animate-float-slow size-36", className)}
    >
      <circle
        cx="100"
        cy="100"
        r="72"
        fill="none"
        stroke="var(--color-primary-100)"
        strokeWidth="1.5"
      />
      <circle
        cx="100"
        cy="100"
        r="46"
        fill="none"
        stroke="var(--color-primary-200)"
        strokeWidth="1.5"
      />
      <circle cx="151" cy="66" r="5" fill="var(--color-primary-300)" />
      <circle cx="58" cy="146" r="3.5" fill="var(--color-primary-200)" />
      <circle cx="152" cy="142" r="3" fill="var(--color-primary-200)" />
      <path
        d="M100 26 L105 40 L100 54 L95 40 Z"
        fill="var(--color-primary-400)"
      />
    </svg>
  );
}

export { MyStartupsDecoration };
