import { cn } from "@/lib/utils";

/**
 * A small numeric badge overlaid on an icon button - the Notifications
 * bell's unread count in `FounderTopBar` / `InvestorTopBar` (see the
 * Sprint 6 brief's "The existing top-bar notification indicator should
 * reflect unread notifications"). Renders nothing at zero, so a founder/
 * investor with no unread notifications sees exactly the plain bell
 * icon that existed before this sprint. Caps the displayed number at
 * "9+" so it never stretches into an oval that crowds the icon.
 */
function UnreadBadge({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null;

  return (
    <span
      aria-hidden
      className={cn(
        "bg-destructive text-destructive-foreground absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-pill px-1 text-[10px] leading-none font-semibold",
        className,
      )}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}

export { UnreadBadge };
