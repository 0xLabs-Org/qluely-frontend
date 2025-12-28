// lib/rateLimit.ts
type Entry = { count: number; reset: number };

const store = new Map<string, Entry>();

export function checkRateLimit(key: string, limit = 60, windowMs = 60_000) {
  const now = Date.now();
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
export function resetRateLimit(key: string) {
  store.delete(key);
}
