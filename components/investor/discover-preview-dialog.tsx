"use client";

import { useState, useTransition } from "react";
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  FileText,
  Globe,
  Loader2,
  SearchX,
} from "lucide-react";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileField } from "@/components/profile/profile-field";
import { ExpressInterestButton } from "@/components/investor/express-interest-button";
import { getDiscoverPitchDeckUrlAction } from "@/lib/discover/discover-actions";
import { formatCount, formatLocation, formatUsd } from "@/lib/startup/format";
import type { StartupDetail } from "@/types/startup";
import type { InterestStatus } from "@/types/interest";

/**
 * The selected startup's preview, as an overlay on top of Discover -
 * revised from the original split-pane layout after design feedback:
 * long, full-width result cards (startup-result-card.tsx) with the
 * preview opening as a modal (Upwork/LinkedIn-style "job details"
 * pattern) instead of a permanently-visible side panel.
 *
 * Built on the shared `Dialog` primitive (Radix under the hood), which
 * gets two behaviors for free that the brief's "PREVIEW BEHAVIOR"
 * section calls for: Escape and clicking the dimmed backdrop both close
 * it, same as the explicit back control does.
 *
 * Purely presentational/controlled - `open`, `loading`, and `startup`
 * are all owned by discover-workspace.tsx (via `useOptimistic`), which
 * is also what `onOpenChange` reports back to. Splitting it this way -
 * rather than this component managing its own open/closed state from
 * the URL directly - is what fixed a real bug: reopening the *same*
 * startup right after closing it could get stuck closed, because a
 * plain "did this id change" check can't tell a fresh reopen of id "A"
 * apart from the id never having changed at all. `useOptimistic` doesn't
 * have that problem - it resets on every render triggered by fresh data,
 * not on a value comparison - so the fix lives in the parent, and this
 * component just renders whatever it's told.
 *
 * `loading` shows a skeleton in place of the real content - the dialog
 * opens the instant a card is clicked, not once the startup's data has
 * actually arrived, so there needs to be *something* to show for
 * however long that takes.
 *
 * On small/medium screens this renders full-screen (the "mobile
 * preview" from the original brief, unchanged); at the `lg` breakpoint
 * it becomes a large centered panel over a dimmed backdrop, with the
 * results grid still visible (and dimmed) behind it.
 *
 * Sprint 6's `ownInterestStatus` follows `startup`/`loading` exactly:
 * `null` while the dialog is on its loading skeleton (there's nothing
 * to show it against yet), otherwise the signed-in investor's own
 * interest status for this startup - see discover-workspace.tsx's
 * `dialogOwnInterestStatus` for where that gating actually happens.
 */
function DiscoverPreviewDialog({
  open,
  loading,
  startup,
  ownInterestStatus,
  onOpenChange,
}: {
  open: boolean;
  loading: boolean;
  startup: StartupDetail | null;
  ownInterestStatus: InterestStatus | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={[
          "flex overflow-hidden",
          // Mobile/tablet: full screen, no card chrome.
          "inset-0 top-0 left-0 h-full max-h-none w-full max-w-none",
          "translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 p-0 shadow-none",
          // Desktop (lg+): large centered panel, dimmed backdrop visible around it.
          "lg:inset-auto lg:top-1/2 lg:left-1/2 lg:h-auto lg:max-h-[calc(100vh-4rem)]",
          "lg:w-full lg:max-w-3xl lg:-translate-x-1/2 lg:-translate-y-1/2",
          "lg:rounded-card lg:border lg:border-border lg:shadow-strong",
        ].join(" ")}
      >
        <DialogTitle className="sr-only">
          {loading ? "Loading startup" : (startup?.name ?? "Startup preview")}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Details for the selected startup, within Discover.
        </DialogDescription>

        <div className="flex shrink-0 items-center border-b border-border px-4 py-3 lg:px-6">
          <DialogClose className="-m-1 inline-flex items-center gap-1.5 rounded-control p-1 text-small font-medium text-gray-600 outline-none transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-primary/30">
            <ArrowLeft className="size-4" aria-hidden />
            Back to startups
          </DialogClose>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 lg:px-6">
          {loading ? (
            <PreviewSkeleton />
          ) : startup ? (
            <PreviewContent startup={startup} ownInterestStatus={ownInterestStatus} />
          ) : (
            <NotFoundState />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-caption font-semibold tracking-wide text-gray-400 uppercase">
      {children}
    </h3>
  );
}

/** Mirrors `PreviewContent`'s section shape, so the swap from skeleton
 * to real content doesn't visibly jump around once data arrives. */
function PreviewSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <span className="sr-only" role="status">
        Loading startup details&hellip;
      </span>
      <div className="flex items-start gap-4" aria-hidden>
        <Skeleton className="size-16 shrink-0 rounded-card" />
        <div className="flex flex-1 flex-col gap-2 pt-1">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>

      {[0, 1, 2].map((section) => (
        <div key={section} className="flex flex-col gap-3 border-t border-border pt-6" aria-hidden>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}
    </div>
  );
}

function PreviewContent({
  startup,
  ownInterestStatus,
}: {
  startup: StartupDetail;
  ownInterestStatus: InterestStatus | null;
}) {
  const location = formatLocation(startup.city, startup.country);
  const hasLinks = Boolean(startup.linkedinUrl || startup.twitterUrl || startup.instagramUrl);

  return (
    <div className="flex flex-col gap-8">
      {startup.coverImageUrl && (
        <div className="-mx-4 -mt-6 aspect-[3/1] overflow-hidden lg:-mx-6 lg:rounded-t-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={startup.coverImageUrl} alt="" className="size-full object-cover" />
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-card border border-border bg-gray-100">
            {startup.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={startup.logoUrl} alt="" className="size-full object-cover" />
            ) : (
              <Building2 className="size-6 text-gray-300" aria-hidden />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-h3 font-semibold text-gray-900">{startup.name}</h2>
            {startup.tagline && <p className="text-small text-gray-500">{startup.tagline}</p>}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-gray-500">
              {startup.industry && <span>{startup.industry.name}</span>}
              {startup.industry && startup.stage && <span aria-hidden>&middot;</span>}
              {startup.stage && <span>{startup.stage.name}</span>}
              {(startup.industry || startup.stage) && location && <span aria-hidden>&middot;</span>}
              {location && <span>{location}</span>}
            </div>
          </div>
        </div>

        {startup.websiteUrl && (
          <a
            href={startup.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-1.5 text-small text-primary hover:underline"
          >
            <Globe className="size-3.5" aria-hidden />
            {startup.websiteUrl}
            <ExternalLink className="size-3" aria-hidden />
          </a>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-6">
        <SectionHeading>About</SectionHeading>
        <div className="flex flex-col gap-5">
          <ProfileField label="Description" value={startup.description} />
          <ProfileField label="Elevator pitch" value={startup.elevatorPitch} />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-6">
        <SectionHeading>Traction</SectionHeading>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <ProfileField label="Customers / users" value={formatCount(startup.customerCount)} />
          <ProfileField label="Employees" value={formatCount(startup.employeeCount)} />
          <ProfileField label="Annual revenue" value={formatUsd(startup.annualRevenue)} />
          <ProfileField label="Monthly revenue" value={formatUsd(startup.monthlyRevenue)} />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-6">
        <SectionHeading>Funding</SectionHeading>
        <ProfileField label="Funding sought" value={formatUsd(startup.fundingAmountSought)} />
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-6">
        <SectionHeading>Pitch Deck</SectionHeading>
        {startup.pitchDeckPath ? (
          <PitchDeckOpener startupId={startup.id} fileName={startup.pitchDeckOriginalName} />
        ) : (
          <span className="text-body text-gray-400 italic">Not added yet</span>
        )}
      </div>

      {hasLinks && (
        <div className="flex flex-col gap-3 border-t border-border pt-6">
          <SectionHeading>Links</SectionHeading>
          <div className="flex flex-wrap gap-4">
            {startup.linkedinUrl && (
              <a
                href={startup.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-small text-primary hover:underline"
              >
                LinkedIn
              </a>
            )}
            {startup.twitterUrl && (
              <a
                href={startup.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-small text-primary hover:underline"
              >
                X (Twitter)
              </a>
            )}
            {startup.instagramUrl && (
              <a
                href={startup.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-small text-primary hover:underline"
              >
                Instagram
              </a>
            )}
          </div>
        </div>
      )}

      {/* Sprint 6's core action, directly below the preview content, per
       * the brief's "FUTURE INTERACTION SPACE" (Sprint 5) / "CORE
       * ACTION" (Sprint 6) - the one primary, non-competing action on
       * this panel. */}
      <div className="border-t border-border pt-6">
        <ExpressInterestButton startupId={startup.id} initialStatus={ownInterestStatus} />
      </div>
    </div>
  );
}

/**
 * "Open pitch deck" - generates a fresh signed URL on click and opens
 * it in a new tab, rather than rendering a persistent link (a signed
 * URL is only valid for 5 minutes, so one generated at page-load time
 * could easily be stale by the time it's clicked).
 *
 * Deliberately opens the deck rather than downloading it: no `download`
 * attribute, no explicit "Download" affordance - it's opened in a new
 * tab the same way any PDF link would be. Whatever download control the
 * browser's own built-in PDF viewer chooses to show around that (Chrome
 * and most browsers add one) is the browser's UI, not this product's -
 * there's no reliable way to suppress that from a signed URL without a
 * heavier viewer integration, which is out of scope here.
 */
function PitchDeckOpener({
  startupId,
  fileName,
}: {
  startupId: string;
  fileName: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleOpen() {
    setError(null);
    startTransition(async () => {
      const result = await getDiscoverPitchDeckUrlAction(startupId);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      window.open(result.url, "_blank", "noopener,noreferrer");
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-small text-gray-600">
          <FileText className="size-3.5 shrink-0" aria-hidden />
          <span>{fileName ?? "Pitch deck"}</span>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={handleOpen} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-3.5 animate-spin" aria-hidden /> Opening&hellip;
            </>
          ) : (
            "Open pitch deck"
          )}
        </Button>
      </div>
      {error && <p className="text-caption text-destructive">{error}</p>}
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-pill bg-primary-50">
        <SearchX className="size-6 text-primary" aria-hidden />
      </div>
      <h2 className="text-h3 font-semibold text-gray-900">This startup isn&apos;t available.</h2>
      <p className="max-w-xs text-small text-gray-500">
        It may have been unpublished or removed.
      </p>
    </div>
  );
}

export { DiscoverPreviewDialog };
