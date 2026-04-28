export interface RateLimitConfig {
  interval: number
  limit: number
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
}

export interface RateLimitBackend {
  check(identifier: string, config: RateLimitConfig): Promise<RateLimitResult | null>
}
