import { RATE_LIMIT } from "./constants";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const existing = buckets.get(ip);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + RATE_LIMIT.windowMs;
    buckets.set(ip, { count: 1, resetAt });
    return { allowed: true, remaining: RATE_LIMIT.maxRequests - 1, resetAt };
  }

  if (existing.count >= RATE_LIMIT.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: RATE_LIMIT.maxRequests - existing.count, resetAt: existing.resetAt };
}
