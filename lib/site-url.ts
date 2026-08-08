/**
 * The canonical site URL, used to build absolute redirect URLs for
 * Supabase auth emails (signup confirmation, password reset). Reads
 * `NEXT_PUBLIC_SITE_URL` so each deployment (local, staging, production)
 * configures its own value rather than the app hardcoding one; see
 * .env.example.
 *
 * Falls back to the browser's own origin when running client-side without
 * the env var set, and to localhost as a last resort for local dev. Never
 * has a trailing slash.
 */
export function getSiteURL(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/+$/, "");

  if (typeof window !== "undefined") return window.location.origin;

  return "http://localhost:3000";
}
