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
 */
export function fetchWithTimeout(timeoutMs = 5000) {
  return (input: RequestInfo | URL, init: RequestInit = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const signal = init.signal
      ? AbortSignal.any([init.signal, controller.signal])
      : controller.signal;

    return fetch(input, { ...init, signal }).finally(() => clearTimeout(timeoutId));
  };
}
