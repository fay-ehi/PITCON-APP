import {
  Handshake,
  Heart,
  Rocket,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The hero's Pinterest-composition collage: one dominant image with 4
 * smaller images loosely arranged around it, varied sizes, no grid
 * alignment - per the "Hero — Pinterest composition" brief, replacing
 * the previous "small PITCON UI fragments" collage (startup card /
 * investor mini-profile / message preview) that a straight redesign of
 * this component made obsolete.
 *
 * The container is `aspect-[11/10]` - close to square, only a slight
 * portrait lean - not the taller `4/5` an earlier pass used: at this
 * component's grid column width (roughly 650-700px on desktop) `4/5`
 * produced an 800px+ tall collage.
 *
 * `max-w-[26rem]` caps the collage at the same width from `sm` up
 * through desktop, rather than letting it stretch to fill the grid
 * column - filling the column made the collage taller than the
 * viewport (its bottom row ran off-screen below the fold on a typical
 * laptop). Capped and `mx-auto`'d within its column, it sits centered
 * with room on either side - closer to the whitespace-heavy feel the
 * brief asks for anyway. Recheck this cap on a real screen if the
 * text-column content ever grows taller than the collage: right now
 * both land in a similar height range at this width, and the parent
 * grid uses `items-start` (see hero.tsx) so the two only need to be
 * close, not equal.
 *
 * COLLAGE_SLOTS below is the one place that defines the collage: swap
 * `src` from `undefined` to a real path (e.g. after dropping files in
 * `/public/images/hero/`) and that slot renders the real photo/
 * illustration instead of its placeholder - nothing else in this file
 * needs to change. Position, size, rotation and stacking live in
 * `className` per slot so the loose, offset arrangement is easy to
 * retune once real images are in.
 *
 * The 4 surrounding slots' boxes are laid out with a couple of percent
 * of breathing room between them and the dominant "founder" slot -
 * deliberately not overlapping it, unlike a literal photo collage.
 * With real photography, overlapping crops read as an intentional
 * layered composition (see the Pinterest reference); with these
 * placeholder boxes, an overlap instead means one box's icon+label sits
 * on top of and clips another's. Once real images are in, nudge the
 * `position` values closer together / negative for a tighter, more
 * Pinterest-literal overlap - each slot's position is isolated here so
 * that's a one-line change per slot.
 *
 * Only the primary ("founder") slot is rendered as a framed box —
 * rounded, clipped, with a deep box-shadow, so it reads as the one
 * "anchored" piece of the composition. The 4 surrounding slots are
 * intentionally un-boxed: no border, no background, no clipping
 * container - just the image (or placeholder icon) with a soft
 * ambient `drop-shadow` that hugs the content instead of a rectangle,
 * so they read as loose pieces floating around the framed image
 * rather than four smaller cards of their own.
 *
 * The tiny "Interest received" notification is the one deliberate nod
 * to PITCON's actual product the brief allows for - kept singular and
 * small so the collage stays primarily visual, not a UI showcase.
 *
 * Motion is entrance-only (fade/zoom/slide, staggered, via the
 * codebase's existing `animate-in ... motion-reduce:animate-none`
 * idiom - see components/onboarding/tour-visuals.tsx) - no continuous
 * float loops here, unlike the previous collage: the brief is explicit
 * that the images shouldn't read as "constantly floating or moving."
 */

type CollageSlot = {
  id: string;
  /** What this slot represents in the founder → investor story - shown
   *  as the placeholder label, and doubles as the alt text once a real
   *  image is dropped in. */
  story: string;
  icon: LucideIcon;
  /** Path to the real photo/illustration once sourced, e.g.
   *  "/images/hero/founder.jpg". Leave undefined to keep the
   *  placeholder. */
  src?: string;
  position: string;
  delay: string;
  primary?: boolean;
};

const COLLAGE_SLOTS: CollageSlot[] = [
  {
    id: "founder",
    story: "Founder",
    icon: UserRound,
    src: "/images/hero/founder.png",
    position: "top-[4%] left-[30%] z-20 h-[68%] w-[44%] rotate-1",
    delay: "[animation-delay:80ms]",
    primary: true,
  },
  {
    id: "startup",
    story: "Startup",
    icon: Rocket,
    src: "/images/hero/startup.png",
    position: "top-0 left-0 z-10 h-[30%] w-[26%] -rotate-3",
    delay: "[animation-delay:180ms]",
  },
  {
    id: "growth",
    story: "Growth",
    icon: TrendingUp,
    src: "/images/hero/growth.png",
    position: "top-0 right-0 z-10 h-[16%] w-[26%] rotate-2",
    delay: "[animation-delay:260ms]",
  },
  {
    id: "investor",
    story: "Investor",
    icon: Handshake,
    src: "/images/hero/investor.png",
    position: "bottom-0 left-0 z-10 h-[30%] w-[28%] -rotate-1",
    delay: "[animation-delay:340ms]",
  },
  {
    id: "connection",
    story: "Connection",
    icon: Users,
    src: "/images/hero/connection.png",
    position: "right-0 bottom-0 z-10 h-[26%] w-[24%] rotate-3",
    delay: "[animation-delay:420ms]",
  },
];

function CollageImage({ slot }: { slot: CollageSlot }) {
  const Icon = slot.icon;

  // Primary slot: framed box - clipped, rounded, deep shadow.
  if (slot.primary) {
    return (
      <div
        className={cn(
          "animate-in fade-in zoom-in-95 rounded-marketing absolute overflow-hidden duration-500 motion-reduce:animate-none",
"shadow-[0_18px_35px_-15px_rgba(88,28,135,0.22),0_30px_60px_-20px_rgba(0,0,0,0.22)]",          slot.position,
          slot.delay,
        )}
      >
        {slot.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={slot.src}
            alt={slot.story}
            className="size-full object-cover"
          />
        ) : (
          <div className="border-border/70 flex size-full flex-col items-center justify-center gap-1.5 border border-dashed bg-gray-50 p-2 text-center">
            <Icon className="size-5 shrink-0 text-gray-300 sm:size-6" />
            <span className="text-caption truncate font-medium text-gray-400">
              {slot.story}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Surrounding slots: no box - unclipped, no border/background, just
  // the image with a soft drop-shadow so it reads as floating rather
  // than as a smaller card.
  return (
    <div
      className={cn(
        "animate-in fade-in zoom-in-95 absolute duration-500 motion-reduce:animate-none",
        slot.position,
        slot.delay,
      )}
    >
      {slot.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={slot.src}
          alt={slot.story}
          className="rounded-marketing size-full object-cover drop-shadow-[0_15px_25px_rgba(0,0,0,0.2)]"
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-1.5 text-center">
          <Icon className="size-5 shrink-0 text-gray-300 sm:size-6" />
          <span className="text-caption truncate font-medium text-gray-400">
            {slot.story}
          </span>
        </div>
      )}
    </div>
  );
}

function HeroVisual({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative mx-auto aspect-[11/10] w-full max-w-[22rem] sm:max-w-[26rem]",
        className,
      )}
    >
      {COLLAGE_SLOTS.map((slot) => (
        <CollageImage key={slot.id} slot={slot} />
      ))}

      {/* Interest notification - the collage's one small UI touch,
          peeking over the founder slot's lower-left corner. */}
      <div
        className={cn(
          "border-border shadow-strong animate-in fade-in slide-in-from-bottom-3 rounded-card absolute bottom-[24%] left-[16%] z-30 w-[42%] -rotate-2 border bg-white p-3 duration-500 [animation-delay:520ms] motion-reduce:animate-none",
        )}
      >
        <div className="flex items-center gap-2.5">
          <span className="bg-primary-50 rounded-pill flex size-8 shrink-0 items-center justify-center">
            <Heart className="text-primary size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-caption truncate font-semibold text-gray-900">
              Interest received
            </p>
            <p className="text-caption truncate text-gray-500">
              on your startup
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export { HeroVisual };