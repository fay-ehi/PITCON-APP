import { Badge } from "@/components/ui/badge";
import type { StartupStatus } from "@/types/startup";

function StartupStatusBadge({ status }: { status: StartupStatus }) {
  if (status === "published") {
    return <Badge variant="primary">Published</Badge>;
  }
  return <Badge variant="default">Draft</Badge>;
}

export { StartupStatusBadge };
