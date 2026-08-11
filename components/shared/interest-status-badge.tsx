import { Check, Clock, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { InterestStatus } from "@/types/interest";

/**
 * The Interest lifecycle's visual state, shared between the Founder's
 * Interests list/detail and the Investor's My Interests list - per the
 * brief's "Use clear visual states. Do not rely solely on color", each
 * variant pairs its own icon with its own label rather than differing
 * by color alone.
 */
function InterestStatusBadge({ status }: { status: InterestStatus }) {
  if (status === "accepted") {
    return (
      <Badge variant="primary">
        <Check aria-hidden /> Accepted
      </Badge>
    );
  }
  if (status === "declined") {
    return (
      <Badge variant="destructive">
        <X aria-hidden /> Declined
      </Badge>
    );
  }
  return (
    <Badge variant="default">
      <Clock aria-hidden /> Pending
    </Badge>
  );
}

export { InterestStatusBadge };
