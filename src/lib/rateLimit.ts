/**
 * Fixed-window, in-memory rate limiter keyed by client id (IP).
 * Prototype scope: per server instance only. A real deployment would use a shared store
 * (e.g. Redis / Vercel KV) or the platform firewall so limits hold across instances.
 */
const WINDOW_MS = 60_000;
export const LIMIT_PER_WINDOW = 20;

const hits = new Map<string, { count: number; windowStart: number }>();

export function allowRequest(clientId: string, now = Date.now()): boolean {
  const entry = hits.get(clientId);
  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    hits.set(clientId, { count: 1, windowStart: now });
    return true;
  }
  entry.count += 1;
  return entry.count <= LIMIT_PER_WINDOW;
}

export function resetRateLimit(): void {
  hits.clear();
}
