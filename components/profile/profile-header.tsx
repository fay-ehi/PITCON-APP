import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

/** Avatar + name + subtitle row shown at the top of the Founder/Investor
 * profile view page. Subtitle is job title @ nothing (Founder) or
 * organization (Investor) - passed in already composed by the caller so
 * this component doesn't need to know about roles. */
function ProfileHeader({
  name,
  avatarUrl,
  subtitle,
}: {
  name: string;
  avatarUrl: string | null;
  subtitle: string | null;
}) {
  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-16">
        <AvatarImage src={avatarUrl ?? undefined} alt="" />
        <AvatarFallback className="text-h3">{initialsFor(name)}</AvatarFallback>
      </Avatar>
      <div>
        <h1 className="text-h3 font-semibold text-gray-900">{name}</h1>
        {subtitle && <p className="text-small text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}

export { ProfileHeader };
