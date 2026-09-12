"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StartupStatusBadge } from "@/components/startup/startup-status-badge";
import { getMissingPublishFields } from "@/lib/startup/completion";
import { deleteStartupAction } from "@/lib/startup/startup-actions";
import { getIndustryAccent } from "@/lib/startup/industry-accent";
import type { StartupDetail } from "@/types/startup";

/**
 * One card in the My Startups grid. Per the Sprint 4 brief's "STARTUP
 * CARD CONTENT": logo, name, tagline, industry/stage, status, and one
 * primary contextual action - "View startup →" for a published startup,
 * "Continue editing →" for a draft - plus an overflow menu for the
 * secondary actions (Edit, Delete) so the card itself isn't overloaded
 * with buttons.
 *
 * No investor-interest count is shown: that data doesn't exist yet (no
 * Interests backend as of this sprint - see app/founder/interests/), and
 * the brief is explicit that it only belongs on the card "if the
 * underlying feature/data exists."
 */
function StartupCard({ startup }: { startup: StartupDetail }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isPublished = startup.status === "published";
  const missingFields = getMissingPublishFields(startup);
  const displayName = startup.name || "Untitled startup";
  const viewHref = `/founder/startups/${startup.id}`;
  const editHref = `/founder/startups/${startup.id}/edit`;
  const accent = getIndustryAccent(startup.industry?.slug);
  const Icon = accent.icon;

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteStartupAction(startup.id);
    setIsDeleting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setDeleteOpen(false);
    toast.success(`${displayName} was deleted.`);
    router.refresh();
  }

  return (
    <>
      <Card className="hover:shadow-medium relative gap-3 overflow-hidden p-5 pt-6 transition-shadow duration-200">
        <div
          aria-hidden
          className={`absolute top-0 left-0 h-1.5 w-full ${accent.solidBg}`}
        />

        <div className="absolute top-4 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-control focus-visible:ring-primary/30 flex size-8 items-center justify-center text-gray-400 transition-colors outline-none hover:bg-gray-100 hover:text-gray-700 focus-visible:ring-2">
              <MoreVertical className="size-4" aria-hidden />
              <span className="sr-only">More actions for {displayName}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={editHref}>
                  <Pencil /> Edit startup
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setDeleteOpen(true)}
              >
                <Trash2 /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-3 pr-8">
          <div
            className={`rounded-card flex size-12 shrink-0 items-center justify-center overflow-hidden ${accent.solidBg}`}
          >
            {startup.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage public URL, not a local/optimizable asset.
              <img
                src={startup.logoUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <Icon className={`size-5 ${accent.solidText}`} aria-hidden />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-body truncate font-semibold text-gray-900">
              {displayName}
            </p>
            {startup.tagline && (
              <p className="text-caption truncate text-gray-500">
                {startup.tagline}
              </p>
            )}
          </div>
        </div>

        {(startup.industry || startup.stage) && (
          <div className="flex flex-wrap items-center gap-2">
            {startup.industry && (
              <span
                className={`text-caption inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium ${accent.softBg} ${accent.softText}`}
              >
                {startup.industry.name}
              </span>
            )}
            {startup.stage && (
              <span className="text-caption text-gray-400">
                {startup.stage.name}
              </span>
            )}
          </div>
        )}

        <StartupStatusBadge status={startup.status} />

        {!isPublished && (
          <p className="text-caption text-gray-500">
            {missingFields.length > 0
              ? `${missingFields.length} field${missingFields.length === 1 ? "" : "s"} left before you can publish.`
              : "Ready to publish."}
          </p>
        )}

        <Link
          href={isPublished ? viewHref : editHref}
          className="text-small text-primary mt-1 inline-flex w-fit items-center gap-1 font-medium hover:underline"
        >
          {isPublished ? "View startup" : "Continue editing"}
          <span aria-hidden>→</span>
        </Link>
      </Card>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {displayName}?</DialogTitle>
            <DialogDescription>
              This permanently removes the startup and its logo, cover image,
              and pitch deck. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeleteOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete startup"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { StartupCard };
