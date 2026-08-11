export interface CacheItem<T = any> {
  data: T;
  expiresAt: number;
  tags?: string[];
}

class MemoryKvCache {
  private cache = new Map<string, CacheItem>();
  private hits = 0;
  private misses = 0;

  get<T = any>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) {
      this.misses++;
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return item.data as T;
  }

  set(key: string, data: any, ttlSeconds: number = 300, tags: string[] = []): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { data, expiresAt, tags });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  invalidateTag(tag: string): void {
    for (const [key, item] of this.cache.entries()) {
      if (item.tags?.includes(tag)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const kvCache = new MemoryKvCache();
