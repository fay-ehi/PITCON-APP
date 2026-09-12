import { Skeleton } from "@/components/ui/skeleton";

/**
 * Shared loading state for every auth screen - added in the pre-launch
 * hardening pass. Mirrors the shape every auth form takes (a couple of
 * labeled fields + a submit button) closely enough to avoid layout
 * shift without needing five near-identical skeletons.
 */
export default function AuthLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="mt-2 h-10 w-full" />
      </div>
    </div>
  );
}
