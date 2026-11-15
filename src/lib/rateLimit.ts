/**
 * Fixed-window, in-memory rate limiter keyed by client id (IP).
 * Prototype scope: per server instance only. A real deployment would use a shared store
 * (e.g. Redis / Vercel KV) or the platform firewall so limits hold across instances.
 */
const WINDOW_MS = 60_000;
export const LIMIT_PER_WINDOW = 20;

/** RATE_LIMIT_PER_MIN overrides the limit (used by the local end-to-end test server). */
function limit(): number {
  const n = Number(process.env.RATE_LIMIT_PER_MIN);
  return Number.isInteger(n) && n > 0 ? n : LIMIT_PER_WINDOW;
}

const hits = new Map<string, { count: number; windowStart: number }>();

export function allowRequest(clientId: string, now = Date.now()): boolean {
  const entry = hits.get(clientId);
  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    hits.set(clientId, { count: 1, windowStart: now });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit();
}

export function resetRateLimit(): void {
  hits.clear();
}
