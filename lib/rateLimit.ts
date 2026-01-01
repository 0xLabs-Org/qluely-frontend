// lib/rateLimit.ts
import Redis from 'ioredis';

type Entry = { count: number; reset: number };

const store = new Map<string, Entry>();

let redis: Redis | null = null;
import { env } from './env';

const redisUrl = env.REDIS_URL || '';

function getRedisClient() {
  if (!redis && redisUrl) {
    redis = new Redis(redisUrl);
    // swallow redis errors to avoid crashing the app if redis is misconfigured
    redis.on('error', () => {});
  }
  return redis;
}

export async function checkRateLimit(key: string, limit = 60, windowMs = 60_000) {
  const now = Date.now();

  const r = getRedisClient();
  if (r) {
    try {
      const count = await r.incr(key);
      if (count === 1) {
        await r.pexpire(key, windowMs);
      }
      const ttl = await r.pttl(key);
      const reset = ttl > 0 ? now + ttl : now + windowMs;
      if (count > limit) {
        return { limited: true, remaining: 0, reset };
      }
      return { limited: false, remaining: Math.max(0, limit - count), reset };
    } catch (err) {
      // fall through to in-memory fallback
    }
  }

  // In-memory fallback (single-process)
  const entry = store.get(key);
  if (!entry || now > entry.reset) {
    store.set(key, { count: 1, reset: now + windowMs });
    return { limited: false, remaining: limit - 1, reset: now + windowMs };
  }

  entry.count += 1;
  store.set(key, entry);
  if (entry.count > limit) {
    return { limited: true, remaining: 0, reset: entry.reset };
  }

  return { limited: false, remaining: limit - entry.count, reset: entry.reset };
}

// Useful for tests or admin to clear a key
export async function resetRateLimit(key: string) {
  const r = getRedisClient();
  if (r) {
    try {
      await r.del(key);
      return;
    } catch (_) {
      // ignore and fallback to memory delete
    }
  }
  store.delete(key);
}
