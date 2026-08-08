import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control text-small font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4",
  {
    variants: {
      variant: {
        // Primary: the main action on a screen. Purple, per the brand rule.
        // Text is explicitly white (not the text-primary-foreground token)
        // so it can never come out looking like anything else.
        primary:
          "bg-primary text-white hover:bg-primary-hover active:bg-primary-700",
        // Secondary — white/light grey with a subtle border.
        secondary:
          "bg-white text-gray-900 border border-border hover:bg-gray-50 active:bg-gray-100",
        // Ghost — no background, used for lower-emphasis actions like "View Profile".
        ghost: "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
        // Tertiary link-style action.
        link: "text-primary underline-offset-4 hover:underline",
        // Reserved for delete/remove actions only.
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        sm: "h-8 px-3 text-caption",
        default: "h-10 px-4",
        lg: "h-12 px-6 text-body",
        icon: "h-10 w-10 shrink-0 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
