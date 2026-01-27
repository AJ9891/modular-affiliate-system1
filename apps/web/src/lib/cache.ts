import { NextRequest } from 'next/server'

interface CacheEntry<T> {
  data: T
  expiresAt: number
  createdAt: number
}

class InMemoryCache {
  private cache = new Map<string, CacheEntry<any>>()
  private maxSize: number
  private defaultTTL: number

  constructor(maxSize: number = 1000, defaultTTL: number = 300000) { // 5 minutes default
    this.maxSize = maxSize
    this.defaultTTL = defaultTTL
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL)
    
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      data,
      expiresAt,
      createdAt: Date.now()
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean up expired entries
  cleanup(): number {
    const now = Date.now()
    let removed = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
        removed++
      }
    }
    
    return removed
  }

  // Get cache stats
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      usage: (this.cache.size / this.maxSize) * 100
    }
  }
}

// Global cache instances
export const analyticsCache = new InMemoryCache(500, 300000) // 5 minutes for analytics
export const aiCache = new InMemoryCache(200, 1800000) // 30 minutes for AI content
export const userDataCache = new InMemoryCache(1000, 600000) // 10 minutes for user data
export const funnelCache = new InMemoryCache(300, 900000) // 15 minutes for funnels

// Cache key generators
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&')
  
  return `${prefix}:${sortedParams}`
}

export function generateUserCacheKey(userId: string, resource: string, params?: Record<string, any>): string {
  const base = `user:${userId}:${resource}`
  if (params) {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&')
    return `${base}:${paramString}`
  }
  return base
}

// Cache warming functions
export async function warmAnalyticsCache(userId: string) {
  // Pre-populate common analytics queries
  const timeRanges = ['7d', '30d', '90d']
  
  for (const range of timeRanges) {
    const cacheKey = generateUserCacheKey(userId, 'analytics', { range })
    
    // This would typically call the actual analytics function
    // We'll just mark the cache as warmed for now
    console.log(`Warming analytics cache for user ${userId}, range ${range}`)
  }
}

// Cleanup function to run periodically
export function runCacheCleanup() {
  const removed = [
    analyticsCache.cleanup(),
    aiCache.cleanup(),
    userDataCache.cleanup(),
    funnelCache.cleanup()
  ].reduce((sum, count) => sum + count, 0)
  
  console.log(`Cache cleanup removed ${removed} expired entries`)
  return removed
}

// Cache wrapper for functions
export function withCache<T>(
  cache: InMemoryCache,
  keyGenerator: (args: any[]) => string,
  ttl?: number
) {
  return function<Args extends any[], Return>(
    fn: (...args: Args) => Promise<Return>
  ) {
    return async (...args: Args): Promise<Return> => {
      const key = keyGenerator(args)
      
      // Try to get from cache
      const cached = cache.get<Return>(key)
      if (cached) {
        return cached
      }
      
      // Execute function and cache result
      const result = await fn(...args)
      cache.set(key, result, ttl)
      
      return result
    }
  }
}

// Specific cache helpers for common use cases
export const cacheAnalytics = withCache(
  analyticsCache,
  ([userId, params]) => generateUserCacheKey(userId, 'analytics', params),
  300000 // 5 minutes
)

export const cacheAIGeneration = withCache(
  aiCache,
  ([prompt, options]) => generateCacheKey('ai', { prompt: prompt.slice(0, 100), ...options }),
  1800000 // 30 minutes
)

export const cacheFunnelData = withCache(
  funnelCache,
  ([userId, funnelId]) => generateUserCacheKey(userId, 'funnel', { funnelId }),
  900000 // 15 minutes
)

// Cache invalidation helpers
export function invalidateUserCache(userId: string, resource?: string) {
  const caches = [analyticsCache, userDataCache, funnelCache]
  let invalidated = 0
  
  for (const cache of caches) {
    // In a real implementation, we'd need to track keys by user
    // For now, just clear the entire cache if no specific resource
    if (!resource) {
      cache.clear()
      invalidated++
    }
  }
  
  console.log(`Invalidated cache for user ${userId}, resource: ${resource || 'all'}`)
  return invalidated
}

// Performance monitoring
export function getCachePerformance() {
  return {
    analytics: analyticsCache.getStats(),
    ai: aiCache.getStats(),
    userData: userDataCache.getStats(),
    funnel: funnelCache.getStats()
  }
}

// Setup periodic cleanup (run this in a background job)
export function setupCacheCleanup(intervalMs: number = 300000) { // 5 minutes
  setInterval(runCacheCleanup, intervalMs)
  console.log(`Cache cleanup scheduled every ${intervalMs / 1000} seconds`)
}