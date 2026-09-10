import { cn } from "@/lib/utils";

/**
 * A marked, colorful placeholder for wherever a real illustration
 * should eventually sit on the landing page — same pattern as
 * HeroVisual's COLLAGE_SLOTS: leave `src` unset to show the brief
 * inside a colorful placeholder box, then once the real illustration
 * is sourced, pass `src` (e.g. "/images/how-it-works/pitch-connect.png")
 * and it renders the real image instead. Nothing else about the
 * component's usage needs to change.
 */
function IllustrationSlot({
  brief,
  src,
  alt,
  className,
}: {
  /** Short description of the artwork to source/commission for this spot. */
  brief: string;
  /** Path to the real illustration once sourced, e.g. "/images/how-it-works/pitch-connect.png". Leave unset to keep the placeholder. */
  src?: string;
  /** Alt text once `src` is set. Defaults to `brief` if omitted. */
  alt?: string;
  className?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt ?? brief}
        className={cn(
          "rounded-marketing size-full object-cover",
          className,
        )}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={brief}
      className={cn(
        "border-primary-200 from-primary-50 via-white to-illustration-amber-50 rounded-marketing relative flex min-h-56 items-center justify-center overflow-hidden border-2 border-dashed bg-gradient-to-br p-8 text-center",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="bg-illustration-coral-50 pointer-events-none absolute -top-8 -right-8 size-28 rounded-full blur-2xl"
      />
      <div
        aria-hidden="true"
        className="bg-primary-100 pointer-events-none absolute -bottom-8 -left-8 size-28 rounded-full blur-2xl"
      />
      <div className="relative max-w-xs">
        <p className="text-caption text-primary-600 font-semibold tracking-wide uppercase">
          Illustration slot
        </p>
        <p className="text-small mt-2 text-gray-600">{brief}</p>
      </div>
    </div>
  );
}

export { IllustrationSlot };
