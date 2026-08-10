"use client";

import * as React from "react";
import { Building2, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { validateLogoFile } from "@/lib/startup/asset-constraints";
import {
  removeStartupLogoAction,
  uploadStartupLogoAction,
} from "@/lib/startup/asset-actions";

/**
 * Startup logo upload/replace/remove control. Same upload/preview/remove
 * flow as `components/profile/avatar-upload.tsx`, framed as a rounded
 * square rather than a circle (a company mark, not a headshot) and
 * backed by the `startup-logos` bucket instead of `avatars`. No
 * cropping UI here either, for the same reason as the avatar picker.
 */
function LogoUpload({
  startupId,
  logoUrl,
  onChange,
  className,
}: {
  startupId: string;
  logoUrl: string | null;
  onChange: (logoUrl: string | null) => void;
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

    const validationError = validateLogoFile(file);
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
      const result = await uploadStartupLogoAction(startupId, formData);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      onChange(result.url);
      toast.success("Logo updated.");
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
      const result = await removeStartupLogoAction(startupId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      onChange(null);
      toast.success("Logo removed.");
    } catch {
      toast.error("Couldn't remove your logo. Please try again.");
    } finally {
      setIsRemoving(false);
    }
  }

  const displayUrl = previewUrl ?? logoUrl;
  const busy = isUploading || isRemoving;

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="relative">
        <div className="rounded-card border-border flex size-20 items-center justify-center overflow-hidden border bg-gray-100">
          {displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={displayUrl} alt="" className="size-full object-cover" />
          ) : (
            <Building2 className="size-8 text-gray-300" aria-hidden />
          )}
        </div>
        {isUploading && (
          <div className="rounded-card absolute inset-0 flex items-center justify-center bg-gray-900/40">
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

      <div className="flex flex-col gap-1">
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
          ) : logoUrl ? (
            "Change logo"
          ) : (
            "Upload logo"
          )}
        </Button>
        {logoUrl && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={busy}
            className="text-caption hover:text-destructive inline-flex items-center gap-1 self-start text-gray-500 disabled:pointer-events-none disabled:opacity-50"
          >
            <X className="size-3" aria-hidden />
            {isRemoving ? "Removing..." : "Remove logo"}
          </button>
        )}
        <p className="text-caption text-gray-400">
          PNG, JPEG, or WEBP. Up to 5MB.
        </p>
      </div>
    </div>
  );
}

export { LogoUpload };
