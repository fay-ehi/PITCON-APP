"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import {
  addToShortlistAction,
  removeFromShortlistAction,
} from "@/lib/shortlist/shortlist-actions";

/**
 * A small bookmark toggle - "save this startup for later" - reusable
 * anywhere a startup is shown to an investor: the Discover result card,
 * the Discover preview dialog, and the My Shortlist page. Local
 * `useState` seeded from `initialShortlisted` (a server-side lookup,
 * same no-loading-flash reasoning as `ExpressInterestButton`'s
 * `initialStatus`), updated optimistically on click and rolled back if
 * the server call fails.
 *
 * `onToggle` is how a parent keeps every rendering of the same
 * startup's shortlist state in sync with each other - toggling from
 * the preview dialog should also update that startup's card in the
 * results list behind it. See discover-workspace.tsx, which owns the
 * shared `shortlistedIds` set both the grid and the dialog read from
 * and update through this callback.
 *
 * A real `<button>`, deliberately never nested inside the result
 * card's `<Link>` - see startup-result-card.tsx's comment on why it's
 * rendered as an overlaid sibling instead.
 */
function ShortlistButton({
  startupId,
  initialShortlisted,
  onToggle,
  className,
}: {
  startupId: string;
  initialShortlisted: boolean;
  onToggle?: (startupId: string, shortlisted: boolean) => void;
  className?: string;
}) {
  const [shortlisted, setShortlisted] = useState(initialShortlisted);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const next = !shortlisted;
    setShortlisted(next);
    startTransition(async () => {
      const result = next
        ? await addToShortlistAction(startupId)
        : await removeFromShortlistAction(startupId);

      if (!result.success) {
        setShortlisted(!next);
        toast.error(result.error);
        return;
      }
      onToggle?.(startupId, next);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={shortlisted}
      aria-label={shortlisted ? "Remove from shortlist" : "Add to shortlist"}
      title={shortlisted ? "Remove from shortlist" : "Add to shortlist"}
      className={cn(
        "rounded-control shadow-subtle inline-flex size-9 items-center justify-center border border-border bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:opacity-60",
        shortlisted &&
          "border-primary-200 bg-primary-50 text-primary hover:bg-primary-50 hover:text-primary",
        className,
      )}
    >
      <Bookmark className={cn("size-4", shortlisted && "fill-current")} aria-hidden />
    </button>
  );
}

export { ShortlistButton };
