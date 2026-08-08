import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Text wordmark for PITCON. There is no logo asset yet — swap the mark
 * below for an SVG/image once brand assets are provided, the props are
 * intentionally kept the same shape so callers won't need to change.
 */
function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string | null;
}) {
  const mark = (
    <span
      className={cn(
        "text-h3 font-bold tracking-tight text-gray-900",
        className,
      )}
    >
      Pit<span className="text-primary">con</span>
    </span>
  );

  if (!href) return mark;

  return (
    <Link href={href} className="inline-flex items-center" aria-label="PITCON home">
      {mark}
    </Link>
  );
}

export { Logo };
