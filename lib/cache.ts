import { unstable_cache } from 'next/cache';
import { revalidateTag } from 'next/cache';

/**
 * Wraps an async function with Next.js unstable_cache.
 * @param callback The async function to cache
 * @param keyParts Array of strings to form the cache key
 * @param tags Array of tags for revalidation
 * @param revalidate number of seconds to revalidate (optional)
 */
export function withCache<T>(
  callback: (...args: any[]) => Promise<T>,
  keyParts: string[],
  tags: string[],
  revalidate?: number | false,
) {
  return unstable_cache(callback, keyParts, {
    tags,
    revalidate,
  });
}

/**
 * Invalidates cache entries associated with the given tag.
 * @param tag The cache tag to invalidate
 */
export async function invalidate(tag: string, profile: string = 'default'): Promise<void> {
  revalidateTag(tag, profile);
}

export default { withCache, invalidate };
