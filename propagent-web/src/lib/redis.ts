// Upstash Redis client + rate limiter. Server-only.
//
// Configure via env:
//   UPSTASH_REDIS_REST_URL
//   UPSTASH_REDIS_REST_TOKEN
//
// If either is missing we fall back to a no-op client so the app still boots
// during local dev / previews without Upstash configured.

import 'server-only';

import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redisConfigured = Boolean(url && token);

type RedisLike = {
  get: <T = unknown>(key: string) => Promise<T | null>;
  set: (key: string, value: unknown, opts?: { ex?: number }) => Promise<'OK' | null>;
  del: (key: string) => Promise<number>;
  incr: (key: string) => Promise<number>;
  expire: (key: string, seconds: number) => Promise<number>;
};

function makeNoopRedis(): RedisLike {
  // Warn once at boot so it's visible in logs.
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
    console.warn(
      '[redis] UPSTASH_REDIS_REST_URL/TOKEN not set — using no-op client. Rate limiting and caching are disabled.',
    );
  }
  return {
    async get() {
      return null;
    },
    async set() {
      return null;
    },
    async del() {
      return 0;
    },
    async incr() {
      return 0;
    },
    async expire() {
      return 0;
    },
  };
}

export const redis: RedisLike = redisConfigured
  ? (new Redis({ url: url!, token: token! }) as unknown as RedisLike)
  : makeNoopRedis();

// ----- Rate limiters -----
//
// Keyed limiters for different endpoints. If Upstash is not configured the
// limiter just always allows — useful in local dev.

function makeLimiter(tokens: number, windowSec: number): Ratelimit | null {
  if (!redisConfigured) return null;
  return new Ratelimit({
    redis: redis as unknown as ConstructorParameters<typeof Ratelimit>[0]['redis'],
    limiter: Ratelimit.slidingWindow(tokens, `${windowSec} s`),
    analytics: true,
    prefix: 'propagent:rl',
  });
}

// 20 AI requests per user per minute.
export const aiLimiter = makeLimiter(20, 60);

// 60 write requests per user per minute.
export const writeLimiter = makeLimiter(60, 60);

export type LimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

export async function checkLimit(
  limiter: Ratelimit | null,
  identifier: string,
): Promise<LimitResult> {
  if (!limiter) {
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }
  const res = await limiter.limit(identifier);
  return {
    success: res.success,
    limit: res.limit,
    remaining: res.remaining,
    reset: res.reset,
  };
}

// ----- Simple cache helpers -----

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    return (await redis.get<T>(key)) ?? null;
  } catch (err) {
    console.warn('[redis] cacheGet failed for', key, err);
    return null;
  }
}

export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number,
): Promise<void> {
  try {
    await redis.set(key, value as unknown, { ex: ttlSeconds });
  } catch (err) {
    console.warn('[redis] cacheSet failed for', key, err);
  }
}
