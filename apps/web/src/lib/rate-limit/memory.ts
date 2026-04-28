import type { RateLimitBackend, RateLimitConfig, RateLimitResult } from './types'

type MemoryEntry = {
  count: number
  resetTime: number
}

export class MemoryRateLimiter implements RateLimitBackend {
  private store = new Map<string, MemoryEntry>()

  async check(identifier: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const now = Date.now()
    const current = this.store.get(identifier)

    if (current && current.resetTime < now) {
      this.store.delete(identifier)
    }

    const entry =
      this.store.get(identifier) ??
      (() => {
        const created: MemoryEntry = { count: 0, resetTime: now + config.interval }
        this.store.set(identifier, created)
        return created
      })()

    if (entry.count >= config.limit) {
      return {
        success: false,
        remaining: 0,
        resetTime: entry.resetTime,
      }
    }

    entry.count += 1
    return {
      success: true,
      remaining: config.limit - entry.count,
      resetTime: entry.resetTime,
    }
  }
}
