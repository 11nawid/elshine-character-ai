const buckets = new Map<string, number[]>();

/** Simple in-memory sliding-window rate limiter. */
export function rateLimitReached(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const cutoff = now - windowMs;
  const hits = (buckets.get(key) || []).filter((ts) => ts > cutoff);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return true;
  }
  hits.push(now);
  buckets.set(key, hits);
  return false;
}

export function cleanupRateLimits(): void {
  if (buckets.size === 0) return;
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [key, hits] of buckets) {
    const fresh = hits.filter((ts) => ts > cutoff);
    if (fresh.length === 0) buckets.delete(key);
    else buckets.set(key, fresh);
  }
}