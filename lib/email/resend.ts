import { Resend } from "resend";

let cachedClient: Resend | null = null;

/**
 * Lazily-created Resend client, cached across invocations within the
 * same server instance. Returns `null` rather than throwing when
 * `RESEND_API_KEY` isn't set, so local dev without email configured
 * still works - `sendEmail()` below is what turns that into a
 * skip-and-log instead of a crash.
 */
export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  if (!cachedClient) {
    cachedClient = new Resend(apiKey);
  }
  return cachedClient;
}
