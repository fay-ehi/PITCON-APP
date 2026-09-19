/**
 * Wraps `fetch` with a hard timeout, for use as the `global.fetch` option
 * passed to a Supabase client.
 *
 * Supabase's auth client (GoTrueClient) retries a failed request several
 * times with backoff before giving up. If the configured Supabase URL is
 * unreachable (local stack not started, project paused, VPN/firewall
 * blocking the connection, etc.), that retry loop is what turns a single
 * bad connection into a 25s+ stall on every request in `proxy.ts` — since
 * `proxy.ts` awaits `supabase.auth.getUser()` on every route.
 *
 * This doesn't fix an unreachable Supabase project — you still need to
 * fix that — but it stops one dead connection from making every route
 * hang for the full retry duration.
 *
 * `lib/supabase/server.ts`'s `createClient()` reuses this same wrapper as
 * the `global.fetch` for its *entire* client — not just auth calls — so
 * without the carve-out below, every `.storage.from(bucket).upload()`
 * made through that client was also bounded to `timeoutMs`. 5s is fine
 * for an auth/DB round trip but nowhere near enough for a multi-MB
 * upload, so anything that took longer than 5s to transfer (a >~1MB
 * image, most real pitch decks) was aborted mid-upload — surfacing as a
 * `StorageUnknownError` wrapping an `AbortError`, not a size-limit
 * rejection. Requests to Supabase Storage's `/storage/v1/` endpoint get a
 * timeout scaled to the payload size instead of the flat `timeoutMs`
 * used for auth/DB calls (see `estimateStorageTimeout` below) - a flat
 * number can't cover both a 200KB logo and a 20MB pitch deck on the same
 * connection. `storageTimeoutMs` is now a *floor*, not the value used
 * directly: small uploads still get at least that much, but a large file
 * on a slow connection gets more instead of being aborted mid-transfer.
 */

// Conservative floor for actual observed throughput to Supabase Storage
// on a slow connection - deliberately pessimistic so the timeout errs
// toward "wait longer" rather than aborting a real, still-progressing
// upload. Tune this down only once uploads are reliably faster than this
// in practice.
const MIN_UPLOAD_BYTES_PER_SECOND = 100 * 1024; // 100KB/s

// Fixed cushion added on top of the size-based estimate, covering
// connection setup plus whatever the calling Server Action does before
// the upload itself (e.g. the list-then-remove-existing-file cleanup in
// `asset-actions.ts` / `pitch-deck-actions.ts`).
const STORAGE_TIMEOUT_OVERHEAD_MS = 15_000;

/** Best-effort payload size in bytes for a fetch `init.body`. Returns
 * `null` when the size can't be determined up front (e.g. a stream),
 * in which case the caller falls back to `storageTimeoutMs`.
 *
 * supabase-js's storage `upload()` doesn't send a `File`/`Blob` body
 * directly - it wraps it in a `FormData` (see `StorageFileApi.uploadOrUpdate`
 * in `@supabase/storage-js`), so the actual `init.body` fetch sees here is
 * a `FormData`, not the `Blob` itself. Without unwrapping that, every
 * storage upload fell through to `null` and got only the flat
 * `storageTimeoutMs` floor - which is exactly why the size-scaling below
 * had no effect the first time around. */
function getBodySize(body: BodyInit | null | undefined): number | null {
  if (body == null) return null;
  if (typeof Blob !== "undefined" && body instanceof Blob) return body.size;
  if (body instanceof ArrayBuffer) return body.byteLength;
  if (ArrayBuffer.isView(body)) return body.byteLength;
  if (typeof FormData !== "undefined" && body instanceof FormData) {
    let total = 0;
    for (const value of body.values()) {
      if (typeof Blob !== "undefined" && value instanceof Blob) {
        total += value.size;
      } else if (typeof value === "string") {
        total += value.length; // field overhead only; negligible next to the file itself
      }
    }
    return total;
  }
  return null;
}

function estimateStorageTimeout(body: BodyInit | null | undefined, floorMs: number): number {
  const size = getBodySize(body);
  if (size == null) return floorMs;
  const estimatedMs =
    STORAGE_TIMEOUT_OVERHEAD_MS + (size / MIN_UPLOAD_BYTES_PER_SECOND) * 1000;
  return Math.max(floorMs, estimatedMs);
}

export function fetchWithTimeout(
  timeoutMs = 5000,
  { storageTimeoutMs = 60_000 }: { storageTimeoutMs?: number } = {},
) {
  return (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    const effectiveTimeout = url.includes("/storage/v1/")
      ? estimateStorageTimeout(init.body, storageTimeoutMs)
      : timeoutMs;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), effectiveTimeout);

    const signal = init.signal
      ? AbortSignal.any([init.signal, controller.signal])
      : controller.signal;

    return fetch(input, { ...init, signal }).finally(() => clearTimeout(timeoutId));
  };
}