/**
 * A small sliding window rate limiter (OWASP: protect costly endpoints from abuse). It lives in the memory of one server
 * instance: with several instances each one counts on its own, so a shared store is needed for a hard limit.
 */
export interface RateLimiter {
  /** Counts a call of `key` and says whether it is allowed; a refused call is not counted. */
  allow: (key: string, now?: number) => boolean;
  reset: () => void;
}

interface Options {
  max: number;
  windowMs: number;
  /** Upper bound of remembered keys; the oldest are dropped first, so memory stays bounded. */
  maxKeys?: number;
}

export function createRateLimiter({ max, windowMs, maxKeys = 10_000 }: Options): RateLimiter {
  const calls = new Map<string, number[]>();

  const recent = (key: string, now: number): number[] => (calls.get(key) ?? []).filter((time) => now - time < windowMs);

  return {
    allow(key, now = Date.now()) {
      const times = recent(key, now);
      if (times.length >= max) {
        calls.set(key, times);
        return false;
      }
      calls.delete(key);
      calls.set(key, [...times, now]);
      while (calls.size > maxKeys) calls.delete(calls.keys().next().value as string);
      return true;
    },
    reset: () => calls.clear(),
  };
}

const MAX_KEY_LENGTH = 64;

/** The caller of a request for the limiter: the first address of `x-forwarded-for`, else `x-real-ip`, else one shared bucket. */
export function clientKey(headers: Pick<Headers, 'get'>): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const key = forwarded || headers.get('x-real-ip')?.trim() || 'unknown';
  return key.slice(0, MAX_KEY_LENGTH);
}
