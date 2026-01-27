import { NextRequest } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store (in production, use Redis)
const store: RateLimitStore = {}

export interface RateLimitConfig {
  interval: number // Time window in milliseconds
  limit: number // Max requests per window
}

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

export function rateLimit(identifier: string, config: RateLimitConfig): {
  success: boolean
  remaining: number
  resetTime: number
} {
  const now = Date.now()
  const key = identifier

  // Clean up expired entries
  if (store[key] && store[key].resetTime < now) {
    delete store[key]
  }

  // Initialize or get current count
  if (!store[key]) {
    store[key] = {
      count: 0,
      resetTime: now + config.interval
    }
  }

  const current = store[key]
  
  // Check if limit exceeded
  if (current.count >= config.limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: current.resetTime
    }
  }

  // Increment count
  current.count++

  return {
    success: true,
    remaining: config.limit - current.count,
    resetTime: current.resetTime
  }
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