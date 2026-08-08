"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast rounded-card border border-border bg-white text-gray-900 shadow-medium text-small",
          description: "text-gray-500",
          actionButton: "bg-primary text-primary-foreground rounded-control",
          cancelButton: "bg-gray-100 text-gray-700 rounded-control",
          error: "border-destructive-50 text-destructive",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
