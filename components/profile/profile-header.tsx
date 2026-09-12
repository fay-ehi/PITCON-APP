import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

/**
 * The hero banner at the top of the Founder/Investor profile view page.
 * Previously a bare avatar + name row sitting directly on the page's
 * white background - now a real hero: a solid brand-gradient panel
 * (same gradient family as the founder dashboard's welcome strip, for
 * one consistent "this is a moment of brand color" language across the
 * app) carrying the avatar, name, role, completion, and the edit
 * action, instead of scattering those across plain page chrome.
 */
function ProfileHeader({
  name,
  avatarUrl,
  subtitle,
  roleLabel,
  editHref,
  completion,
}: {
  name: string;
  avatarUrl: string | null;
  subtitle: string | null;
  /** "Founder" or "Investor" - shown as a small pill above the name. */
  roleLabel: string;
  editHref: string;
  /** 0-100. The completion pill hides itself once a profile is fully filled in. */
  completion: number;
}) {
  return (
    <div
      className="shadow-medium relative overflow-hidden rounded-2xl p-6 sm:p-8"
      style={{ background: "linear-gradient(120deg, #7634C8 0%, #9450DA 100%)" }}
    >
      <div className="relative flex flex-wrap items-start justify-between gap-5">
        <div className="flex items-center gap-4">
          <Avatar className="size-20 shrink-0 ring-4 ring-white/25">
            <AvatarImage src={avatarUrl ?? undefined} alt="" />
            <AvatarFallback className="text-h3 bg-white/20 text-white">
              {initialsFor(name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="mb-1.5 inline-flex items-center rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-white">
              {roleLabel}
            </span>
            <h1 className="text-h2 font-bold text-white">{name}</h1>
            {subtitle && <p className="text-small text-white/80">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {completion < 100 && (
            <span className="hidden items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white sm:inline-flex">
              {completion}% complete
            </span>
          )}
          <Button
            asChild
            size="sm"
            className="border-0 bg-white text-primary-700 hover:bg-white/90"
          >
            <Link href={editHref}>Edit profile</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export { ProfileHeader };
