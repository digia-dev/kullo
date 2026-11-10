type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5000;

function prune(now: number) {
  if (buckets.size < MAX_BUCKETS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/** Rate limit in-memory per proses. Untuk multi-instance produksi, ganti dengan Redis. */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  prune(now);
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }
  if (existing.count >= limit) {
    return { allowed: false, retryAfterMs: Math.max(0, existing.resetAt - now) };
  }
  existing.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

export function resetRateLimit(key: string) {
  buckets.delete(key);
}

export function retryMinutes(retryAfterMs: number) {
  return Math.max(1, Math.ceil(retryAfterMs / 60_000));
}
