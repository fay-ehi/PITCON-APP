import { MessageSquare } from "lucide-react";

/**
 * "EMPTY STATES" / "No conversations": shown when the signed-in user has
 * no conversations at all yet (as opposed to having some, just none
 * selected - see `SelectConversationState` inside messages-workspace.tsx
 * for that case). Role-aware copy explains *why* - conversations only
 * exist once an interest has been accepted, per the brief's "Provide
 * appropriate context explaining that conversations become available
 * after an accepted Interest."
 */
function NoConversationsState({ role }: { role: "founder" | "investor" }) {
  return (
    <div className="rounded-card border-border mt-8 flex flex-col items-center justify-center gap-3 border bg-white px-6 py-16 text-center">
      <div className="rounded-pill bg-primary-50 flex size-14 items-center justify-center">
        <MessageSquare className="text-primary size-6" aria-hidden />
      </div>
      <div>
        <p className="text-small font-medium text-gray-900">
          No conversations yet
        </p>
        <p className="text-caption mt-1 max-w-xs text-gray-500">
          {role === "founder"
            ? "Once you accept an investor's interest in one of your startups, you can message them here."
            : "Once a founder accepts your interest in their startup, you can message them here."}
        </p>
      </div>
    </div>
  );
}

export { NoConversationsState };
