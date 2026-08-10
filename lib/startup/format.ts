/** Same formatting convention as `formatUsd` in
 * app/investor/profile/page.tsx - kept local to the startup module
 * rather than shared, since PITCON doesn't have a general-purpose
 * formatting utils file yet and duplicating one small function is
 * cheaper than introducing one for a single reuse. */
export function formatUsd(amount: number | null): string | null {
  if (amount === null) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCount(value: number | null): string | null {
  if (value === null) return null;
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatLocation(
  city: string | null,
  country: string | null,
): string | null {
  if (city && country) return `${city}, ${country}`;
  return city ?? country ?? null;
}
