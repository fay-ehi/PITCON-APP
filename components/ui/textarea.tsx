import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full rounded-input border border-transparent bg-input-background px-3 py-2 text-body text-gray-900 outline-none transition-colors",
        "placeholder:text-gray-400",
        "hover:border-gray-300",
        "focus-visible:border-primary focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/20",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-transparent",
        "aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/20",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
