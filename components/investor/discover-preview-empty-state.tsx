import { MousePointerClick, SearchX } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

/**
 * The preview pane's resting state - "Select a startup to learn more"
 * by default, per the Sprint 5 brief's "PREVIEW BEHAVIOR" section, or a
 * "not found" variant if `?startup=` points at something that isn't (or
 * is no longer) a published startup - e.g. a stale link, or the founder
 * unpublished it after the investor loaded Discover.
 */
function DiscoverPreviewEmptyState({ notFound = false }: { notFound?: boolean }) {
  return (
    <Card className="h-full items-center justify-center py-4 text-center">
      <CardContent className="flex flex-col items-center gap-3 py-16">
        <div className="flex size-14 items-center justify-center rounded-pill bg-primary-50">
          {notFound ? (
            <SearchX className="size-6 text-primary" aria-hidden />
          ) : (
            <MousePointerClick className="size-6 text-primary" aria-hidden />
          )}
        </div>
        <h2 className="text-h3 font-semibold text-gray-900">
          {notFound ? "This startup isn't available." : "Select a startup to learn more."}
        </h2>
        {notFound && (
          <p className="max-w-xs text-small text-gray-500">
            It may have been unpublished or removed.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export { DiscoverPreviewEmptyState };
