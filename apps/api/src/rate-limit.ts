// インメモリ・レートリミッタ（単一インスタンス前提の MVP 用）
// 本番マルチインスタンス化時は Cloudflare KV / Durable Object 等へ移行する

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();
const MAX_ENTRIES = 10000;

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  if (store.size >= MAX_ENTRIES) {
    // 古いエントリを掃除してメモリ枯渇を防ぐ
    for (const [k, bucket] of store) {
      if (bucket.resetAt <= now) store.delete(k);
    }
  }
  const bucket = store.get(key);
  if (!bucket || bucket.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }
  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function clearRateLimits(): void {
  store.clear();
}

export function clientIp(c: { req: { header: (name: string) => string | undefined } }): string {
  return (
    c.req.header("cf-connecting-ip") ??
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
    "local"
  );
}
