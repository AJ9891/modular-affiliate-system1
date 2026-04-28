type CacheEntry<T> = {
  expiresAt: number
  value: T
}

export class InMemoryCache<T> {
  private store = new Map<string, CacheEntry<T>>()

  get(key: string): T | null {
    const item = this.store.get(key)
    if (!item) return null

    if (item.expiresAt <= Date.now()) {
      this.store.delete(key)
      return null
    }

    return item.value
  }

  set(key: string, value: T, ttlMs: number): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    })
  }
}
