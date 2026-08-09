"use client";

import * as React from "react";
import { Camera, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { validateAvatarFile } from "@/lib/profile/avatar-constraints";
import {
  removeAvatarAction,
  uploadAvatarAction,
} from "@/lib/profile/avatar-actions";

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

/**
 * Avatar photo upload/replace/remove control. Shared between the
 * Founder and Investor profile edit + onboarding forms - avatar upload
 * itself doesn't differ by role, only where the resulting URL gets used
 * (`profiles.avatar_url` is a shared column).
 *
 * Deliberately no cropping UI, per the Sprint 2 brief ("do not build
 * image editing/cropping functionality unless it is genuinely
 * required") - the image is shown `object-cover`'d into a circle both
 * here and everywhere else it's displayed.
 */
function AvatarUpload({
  name,
  avatarUrl,
  onChange,
  className,
}: {
  /** Used for the fallback initials when there's no photo yet. */
  name: string;
  avatarUrl: string | null;
  onChange: (avatarUrl: string | null) => void;
  className?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isRemoving, setIsRemoving] = React.useState(false);

  // Revoke the local object URL once we no longer need it, so we don't
  // leak memory across repeated photo changes in one session.
  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleFileSelected(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    const validationError = validateAvatarFile(file);
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
      const result = await uploadAvatarAction(formData);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      onChange(result.avatarUrl);
      toast.success("Photo updated.");
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
      const result = await removeAvatarAction();
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      onChange(null);
      toast.success("Photo removed.");
    } catch {
      toast.error("Couldn't remove your photo. Please try again.");
    } finally {
      setIsRemoving(false);
    }
  }

  const displayUrl = previewUrl ?? avatarUrl ?? undefined;
  const busy = isUploading || isRemoving;

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="relative">
        <Avatar className="size-20">
          <AvatarImage src={displayUrl} alt="" />
          <AvatarFallback className="text-h3">
            {initialsFor(name)}
          </AvatarFallback>
        </Avatar>
        {isUploading && (
          <div className="rounded-pill absolute inset-0 flex items-center justify-center bg-gray-900/40">
            <Loader2 className="size-5 animate-spin text-white" aria-hidden />
          </div>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          aria-label="Change photo"
          className="rounded-pill bg-primary shadow-subtle hover:bg-primary-hover absolute -right-1 -bottom-1 flex size-8 items-center justify-center border-2 border-white text-white transition-colors disabled:pointer-events-none disabled:opacity-50"
        >
          <Camera className="size-4" aria-hidden />
        </button>
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
          ) : (
            "Change photo"
          )}
        </Button>
        {avatarUrl && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={busy}
            className="text-caption hover:text-destructive inline-flex items-center gap-1 self-start text-gray-500 disabled:pointer-events-none disabled:opacity-50"
          >
            <X className="size-3" aria-hidden />
            {isRemoving ? "Removing..." : "Remove photo"}
          </button>
        )}
        <p className="text-caption text-gray-400">
          PNG, JPEG, or WEBP. Up to 5MB.
        </p>
      </div>
    </div>
  );
}

export { AvatarUpload };
