import type { Database } from "@/types/database.types";

/**
 * Human-readable labels for the `investor_type` Postgres enum (see the
 * Sprint 2 migration). Sourced from the PRD's investor taxonomy: "Angel
 * investor, VC, accelerator, syndicate, or corporate investor."
 *
 * Kept as a small hand-maintained list (rather than a database table like
 * `industries`/`startup_stages`) because, unlike industries, this set
 * isn't expected to grow - it mirrors the fixed enum type.
 */
export type InvestorType = Database["public"]["Enums"]["investor_type"];

export const INVESTOR_TYPES: { value: InvestorType; label: string }[] = [
  { value: "angel", label: "Angel Investor" },
  { value: "vc", label: "Venture Capital (VC)" },
  { value: "accelerator", label: "Accelerator / Incubator" },
  { value: "syndicate", label: "Syndicate" },
  { value: "corporate", label: "Corporate Investor" },
];

export function investorTypeLabel(
  value: InvestorType | null | undefined,
): string | null {
  if (!value) return null;
  return INVESTOR_TYPES.find((t) => t.value === value)?.label ?? null;
}
