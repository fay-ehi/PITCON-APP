import { Skeleton } from "@/components/ui/skeleton";

/**
 * Admin overview's loading state - mirrors the two list sections. No
 * <Container> wrapper, same reasoning as app/admin/error.tsx.
 */
export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-10">
      {Array.from({ length: 2 }).map((_, section) => (
        <div key={section}>
          <Skeleton className="mb-4 h-6 w-40" />
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, row) => (
              <div
                key={row}
                className="flex items-center justify-between gap-4 rounded-card border border-border p-4"
              >
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-3.5 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
