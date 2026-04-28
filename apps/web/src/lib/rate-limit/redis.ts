import type { RateLimitBackend, RateLimitConfig, RateLimitResult } from './types'

type RedisRestConfig = {
  url: string
  token: string
}

function loadRedisRestConfig(): RedisRestConfig | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    return null
  }

  return {
    url: url.replace(/\/+$/, ''),
    token,
  }
}

export class RedisRateLimiter implements RateLimitBackend {
  private config = loadRedisRestConfig()

  isConfigured(): boolean {
    return !!this.config
  }

  async check(identifier: string, config: RateLimitConfig): Promise<RateLimitResult | null> {
    if (!this.config) return null

    const now = Date.now()
    const bucket = Math.floor(now / config.interval)
    const resetTime = (bucket + 1) * config.interval
    const ttlSeconds = Math.max(1, Math.ceil((resetTime - now) / 1000))
    const key = `rl:${identifier}:${bucket}`

    try {
      const response = await fetch(`${this.config.url}/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          ['INCR', key],
          ['EXPIRE', key, ttlSeconds],
        ]),
        cache: 'no-store',
      })

      if (!response.ok) {
        return null
      }

      const data = (await response.json()) as Array<{ result?: unknown; error?: string }>
      const incrementRaw = data?.[0]?.result
      const increment = Number(incrementRaw)

      if (!Number.isFinite(increment)) {
        return null
      }

      return {
        success: increment <= config.limit,
        remaining: Math.max(0, config.limit - increment),
        resetTime,
      }
    } catch {
      return null
    }
  }
}
