import * as React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

function FormBanner({
  children,
  variant = "error",
  className,
}: {
  children: React.ReactNode;
  variant?: "error" | "success";
  className?: string;
}) {
  const Icon = variant === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "mb-6 flex items-start gap-2 rounded-card border px-4 py-3 text-small",
        variant === "error" &&
          "border-destructive-50 bg-destructive-50 text-destructive",
        variant === "success" && "border-primary-100 bg-primary-50 text-primary-700",
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>{children}</p>
    </div>
  );
}

export { FormBanner };
