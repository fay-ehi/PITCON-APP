import * as React from "react";

import { cn } from "@/lib/utils";

type ContainerProps = React.ComponentProps<"div"> & {
  /**
   * "content"  – standard app/marketing content width (1280px). Default.
   * "wide"     – wider marketing sections (1440px).
   * "narrow"   – forms, auth screens, focused single-column content.
   */
  width?: "content" | "wide" | "narrow";
};

const widthClasses: Record<NonNullable<ContainerProps["width"]>, string> = {
  content: "max-w-content",
  wide: "max-w-wide",
  narrow: "max-w-xl",
};

function Container({
  className,
  width = "content",
  ...props
}: ContainerProps) {
  return (
    <div
      data-slot="container"
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        widthClasses[width],
        className,
      )}
      {...props}
    />
  );
}

export { Container };
