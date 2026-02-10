type CacheEntry = {
  value: string;
  expiresAt: number; // epoch ms
};

const memStore = new Map<string, CacheEntry>();

export async function get(key: string): Promise<string | null> {
  const entry = memStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memStore.delete(key);
    return null;
  }
  return entry.value;
}

export async function setWithTTL(key: string, value: string, ttlSeconds: number): Promise<void> {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  memStore.set(key, { value, expiresAt });
}

export default { get, setWithTTL };
