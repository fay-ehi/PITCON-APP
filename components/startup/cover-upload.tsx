"use client";

import * as React from "react";
import { ImageIcon, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { validateCoverFile } from "@/lib/startup/asset-constraints";
import {
  removeStartupCoverAction,
  uploadStartupCoverAction,
} from "@/lib/startup/asset-actions";

/**
 * Startup cover image upload/replace/remove control. Optional per the
 * planning document (not part of its "Required fields" list for Create
 * Startup), shown as a wide banner rather than the logo's square frame -
 * matches how it's used everywhere else (Startup Profile hero, Wireframe
 * 5). Backed by the `startup-covers` bucket.
 */
function CoverUpload({
  startupId,
  coverImageUrl,
  onChange,
  className,
}: {
  startupId: string;
  coverImageUrl: string | null;
  onChange: (coverImageUrl: string | null) => void;
  className?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isRemoving, setIsRemoving] = React.useState(false);

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleFileSelected(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const validationError = validateCoverFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadStartupCoverAction(startupId, formData);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      onChange(result.url);
      toast.success("Cover image updated.");
    } catch {
      toast.error("Couldn't upload that image. Please try again.");
    } finally {
      setIsUploading(false);
      setPreviewUrl(null);
    }
  }

  async function handleRemove() {
    setIsRemoving(true);
    try {
      const result = await removeStartupCoverAction(startupId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      onChange(null);
      toast.success("Cover image removed.");
    } catch {
      toast.error("Couldn't remove your cover image. Please try again.");
    } finally {
      setIsRemoving(false);
    }
  }

  const displayUrl = previewUrl ?? coverImageUrl;
  const busy = isUploading || isRemoving;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="rounded-card border-border relative flex aspect-[3/1] w-full items-center justify-center overflow-hidden border bg-gray-100">
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={displayUrl} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-gray-400">
            <ImageIcon className="size-6" aria-hidden />
            <span className="text-caption">No cover image yet</span>
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/40">
            <Loader2 className="size-5 animate-spin text-white" aria-hidden />
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileSelected}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

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
          ) : coverImageUrl ? (
            "Change cover"
          ) : (
            "Upload cover"
          )}
        </Button>
        {coverImageUrl && (
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
        <p className="text-caption text-gray-400">
          Optional. PNG, JPEG, or WEBP. Up to 8MB.
        </p>
      </div>
    </div>
  );
}

export { CoverUpload };
