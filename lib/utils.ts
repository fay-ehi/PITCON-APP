import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * app/globals.css defines a custom font-size scale via `@theme`
 * (--text-display, --text-h1, --text-h2, --text-h3, --text-body-lg,
 * --text-body, --text-small, --text-caption), which Tailwind turns into
 * utilities like `text-body` / `text-caption`. tailwind-merge doesn't
 * know these are font sizes and not colors, so by default it treats them
 * as conflicting with real text-color utilities (`text-white`,
 * `text-gray-900`, ...) — whichever one appears LAST in the class string
 * wins and the other is silently dropped. In practice this meant e.g.
 * `buttonVariants({ variant: "primary", size: "lg" })` produced
 * `"... text-white ... text-body ..."`, and twMerge stripped text-white,
 * leaving buttons with no explicit color (falling back to inherited body
 * text instead of white). Registering the custom scale under its own
 * font-size group stops it from being treated as a color.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["display", "h1", "h2", "h3", "body-lg", "body", "small", "caption"] },
      ],
    },
  },
});

/**
 * Merge conditional class names and resolve Tailwind class conflicts
 * (e.g. `cn("p-2", isLarge && "p-4")` correctly keeps only "p-4").
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
