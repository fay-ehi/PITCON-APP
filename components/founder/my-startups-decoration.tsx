import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * The small decorative visual in the lower right of the My Startups
 * workspace (Sprint 4 brief: "small, elegant, subtle, non-distracting").
 * Originally an abstract inline SVG (orbit rings + satellite dots);
 * swapped for a custom illustration at Star's request - same size,
 * position, and floating animation, just a different image source.
 * `public/images/founder/my-startups-decoration.png`. Purely
 * decorative (`aria-hidden`, empty `alt`), so it stays invisible to
 * assistive tech, same as the SVG it replaced. The float animation is
 * defined in globals.css and only ever applies under
 * `prefers-reduced-motion: no-preference` - with reduced motion
 * requested, this renders fully static.
 */
function MyStartupsDecoration({ className }: { className?: string }) {
  return (
    <Image
      src="/images/founder/my-startups-decoration.png"
      alt=""
      aria-hidden="true"
      width={500}
      height={500}
className={cn("animate-float-slow size-20 object-contain", className)}    />
  );
}

export { MyStartupsDecoration };
