"use client";

import * as React from "react";
import { FileText, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { validatePitchDeckFile } from "@/lib/startup/asset-constraints";
import {
  removePitchDeckAction,
  uploadPitchDeckAction,
} from "@/lib/startup/pitch-deck-actions";

/**
 * Pitch deck (PDF) upload/replace/remove control. Unlike the logo/cover
 * pickers there's no image preview - the file just isn't publicly
 * viewable at all (`pitch-decks` is a private bucket, see the Sprint 3
 * migration), so this only ever shows the original filename the founder
 * uploaded, never a link to the file itself. Viewing/downloading the
 * founder's own deck happens on the read-only preview page via a signed
 * URL, not from this form.
 */
function PitchDeckUpload({
  startupId,
  pitchDeckPath,
  pitchDeckOriginalName,
  onChange,
  className,
}: {
  startupId: string;
  pitchDeckPath: string | null;
  pitchDeckOriginalName: string | null;
  onChange: (value: {
    path: string | null;
    originalName: string | null;
  }) => void;
  className?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isRemoving, setIsRemoving] = React.useState(false);

  async function handleFileSelected(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const validationError = validatePitchDeckFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadPitchDeckAction(startupId, formData);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      onChange({ path: result.path, originalName: result.originalName });
      toast.success("Pitch deck uploaded.");
    } catch {
      toast.error("Couldn't upload that file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleRemove() {
    setIsRemoving(true);
    try {
      const result = await removePitchDeckAction(startupId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      onChange({ path: null, originalName: null });
      toast.success("Pitch deck removed.");
    } catch {
      toast.error("Couldn't remove that file. Please try again.");
    } finally {
      setIsRemoving(false);
    }
  }

  const busy = isUploading || isRemoving;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {pitchDeckPath && (
        <div className="rounded-input border-border flex items-center gap-3 border bg-gray-50 px-3 py-2.5">
          <FileText className="text-primary size-5 shrink-0" aria-hidden />
          <p className="text-small truncate text-gray-700">
            {pitchDeckOriginalName ?? "pitch-deck.pdf"}
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          {isUploading ? (
            <>
              <Loader2 className="animate-spin" aria-hidden />
              Uploading...
            </>
          ) : pitchDeckPath ? (
            "Replace PDF"
          ) : (
            "Upload PDF"
          )}
        </Button>
        {pitchDeckPath && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={busy}
            className="text-caption hover:text-destructive inline-flex items-center gap-1 text-gray-500 disabled:pointer-events-none disabled:opacity-50"
          >
            <X className="size-3" aria-hidden />
            {isRemoving ? "Removing..." : "Remove"}
          </button>
        )}
        <p className="text-caption text-gray-400">PDF only. Up to 20MB.</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileSelected}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}

export { PitchDeckUpload };
