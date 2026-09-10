"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Wraps a section/element that should animate in once scrolled into
 * view - the landing page's "Smooth section reveals" (Sprint 11 brief's
 * "Animation" section). One `IntersectionObserver` per instance,
 * disconnects once it's revealed - decorative entrance motion, not a
 * repeating scroll effect that would fight the user's scrolling.
 *
 * `phase` defaults to `"static"` - no special classes, fully visible -
 * which is also exactly what server-rendered/pre-hydration markup looks
 * like, so there's no hydration mismatch and nothing to get stuck
 * permanently invisible if JS never runs. The *only* state transitions
 * happen inside the `IntersectionObserver` callback (`"hidden"` once we
 * know the browser allows motion and the element isn't in view yet,
 * `"visible"` once it scrolls into view) - i.e. exactly the "subscribe
 * to an external system, setState in its callback" shape, not a
 * synchronous `setState` call in the effect body itself.
 *
 * Reduced motion is handled by simply never starting that subscription
 * (the effect returns early), so the element stays in its default
 * `"static"`/visible state - same "gate the whole thing behind the
 * media query rather than a faster/instant version of the animation"
 * reasoning as `.animate-float-slow` in globals.css, just via JS here
 * since it also needs to skip the scroll-triggered logic entirely.
 */
function Reveal({
  children,
  className,
  delayMs = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [phase, setPhase] = React.useState<"static" | "hidden" | "visible">(
    "static",
  );

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPhase("visible");
          observer.disconnect();
        } else {
          setPhase("hidden");
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={phase === "visible" ? { animationDelay: `${delayMs}ms` } : undefined}
      className={cn(
        phase === "hidden" && "opacity-0",
        // Same animate-in + motion-reduce:animate-none idiom as the
        // onboarding tour miniatures (components/onboarding/tour-visuals.tsx).
        phase === "visible" &&
          "animate-in fade-in slide-in-from-bottom-6 duration-700 motion-reduce:animate-none",
        className,
      )}
    >
      {children}
    </div>
  );
}

export { Reveal };
