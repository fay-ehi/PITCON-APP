"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { ShortlistCard } from "@/components/investor/shortlist-card";
import { cn } from "@/lib/utils";
import type { ShortlistedStartup } from "@/types/shortlist";

/**
 * Owns the one piece of client state `/investor/shortlist` needs: the
 * list itself, so removing a card (via `ShortlistCard`'s bookmark
 * toggle) updates this page immediately rather than waiting on the
 * next full page load's `revalidatePath`. Everything else about that
 * page - the initial fetch, the page-level empty state for "never
 * shortlisted anything" - stays server-rendered in page.tsx; this
 * component only needs to handle emptying out *during* the session.
 */
function ShortlistWorkspace({
  initialShortlist,
  className,
}: {
  initialShortlist: ShortlistedStartup[];
  className?: string;
}) {
  const [shortlist, setShortlist] = useState(initialShortlist);

  function handleRemoved(startupId: string) {
    setShortlist((prev) => prev.filter((s) => s.id !== startupId));
  }

  if (shortlist.length === 0) {
    return (
      <Card className={cn(className)}>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="rounded-pill bg-primary-50 flex size-14 items-center justify-center">
            <Bookmark className="text-primary size-6" aria-hidden />
          </div>
          <div>
            <p className="text-small font-medium text-gray-900">Nothing shortlisted yet</p>
            <p className="text-caption mt-1 max-w-xs text-gray-500">
              Tap the bookmark icon on any startup in Discover to save it here for later.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {shortlist.map((startup) => (
        <ShortlistCard key={startup.id} startup={startup} onRemoved={handleRemoved} />
      ))}
    </div>
  );
}

export { ShortlistWorkspace };
