"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Only these auth screens get a "back to home" close button. Deliberately
 * excludes /verify-email and /reset-password: those are mid-flow steps
 * (right after signing up, or from a password-reset email link) where
 * bouncing back to the marketing homepage instead of finishing the flow
 * is more likely to be a mis-click than an intentional exit.
 */
const PATHS_WITH_CLOSE_BUTTON = ["/signup", "/login", "/forgot-password"];

/**
 * Small grey "X" in the corner of the auth card/header, linking back to
 * the marketing homepage. Lives in app/(auth)/layout.tsx so it's
 * positioned consistently across the mobile header and the desktop card,
 * but reads the current route itself (via usePathname) so it can opt out
 * on the screens above without the layout needing to know the route.
 */
function AuthCloseButton({ className }: { className?: string }) {
  const pathname = usePathname();
  if (!PATHS_WITH_CLOSE_BUTTON.includes(pathname)) return null;

  return (
    <Link
      href="/"
      aria-label="Close and return to PITCON home"
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600",
        className,
      )}
    >
      <X className="size-5" aria-hidden />
    </Link>
  );
}

export { AuthCloseButton };
