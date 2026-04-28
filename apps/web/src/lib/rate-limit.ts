import { NextRequest } from 'next/server'
import { MemoryRateLimiter } from './rate-limit/memory'
import { RedisRateLimiter } from './rate-limit/redis'
import type { RateLimitConfig, RateLimitResult } from './rate-limit/types'

export const RATE_LIMIT_CONFIGS = {
  // API endpoints
  api: { interval: 60 * 1000, limit: 100 }, // 100 requests per minute
  auth: { interval: 15 * 60 * 1000, limit: 5 }, // 5 login attempts per 15 minutes
  ai: { interval: 60 * 1000, limit: 10 }, // 10 AI requests per minute
  upload: { interval: 60 * 1000, limit: 20 }, // 20 uploads per minute
  
  // User tiers
  starter: { interval: 60 * 1000, limit: 50 },
  pro: { interval: 60 * 1000, limit: 200 },
  agency: { interval: 60 * 1000, limit: 500 },
} as const

const memoryLimiter = new MemoryRateLimiter()
const redisLimiter = new RedisRateLimiter()
let redisUnavailableLogged = false

export async function rateLimit(identifier: string, config: RateLimitConfig): Promise<RateLimitResult> {
  const redisResult = await redisLimiter.check(identifier, config)
  if (redisResult) {
    return redisResult
  }

  if (redisLimiter.isConfigured() && !redisUnavailableLogged) {
    redisUnavailableLogged = true
    console.warn('[RateLimit] Redis backend unavailable, falling back to in-memory limits.')
  }

  return memoryLimiter.check(identifier, config)
}

export function getRateLimitKey(req: NextRequest, type: string = 'api'): string {
  // Try to get user ID from headers (set by auth middleware)
  const userId = req.headers.get('x-user-id')
  if (userId) {
    return `${type}:user:${userId}`
  }

  // Fall back to IP address
  const forwardedFor = req.headers.get('x-forwarded-for')
  const ip = forwardedFor?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown'
  
  return `${type}:ip:${ip}`
}

export function getUserTierRateLimit(userPlan?: string): RateLimitConfig {
  switch (userPlan?.toLowerCase()) {
    case 'starter': return RATE_LIMIT_CONFIGS.starter
    case 'pro': return RATE_LIMIT_CONFIGS.pro  
    case 'agency': return RATE_LIMIT_CONFIGS.agency
    default: return RATE_LIMIT_CONFIGS.api
  }
}
