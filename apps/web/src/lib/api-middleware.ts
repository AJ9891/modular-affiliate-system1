import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getRateLimitKey, RATE_LIMIT_CONFIGS } from './rate-limit'
import { addSecurityHeaders } from './security'

export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  limitType: keyof typeof RATE_LIMIT_CONFIGS = 'api'
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const identifier = getRateLimitKey(req, limitType)
    const config = RATE_LIMIT_CONFIGS[limitType]
    
    const { success, remaining, resetTime } = rateLimit(identifier, config)
    
    if (!success) {
      const response = NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: `Too many requests. Try again in ${Math.ceil((resetTime - Date.now()) / 1000)} seconds.`
        },
        { status: 429 }
      )
      
      response.headers.set('X-RateLimit-Limit', config.limit.toString())
      response.headers.set('X-RateLimit-Remaining', '0')
      response.headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString())
      response.headers.set('Retry-After', Math.ceil((resetTime - Date.now()) / 1000).toString())
      
      return addSecurityHeaders(response)
    }
    
    // Call the actual handler
    const response = await handler(req)
    
    // Add rate limit headers to successful responses
    response.headers.set('X-RateLimit-Limit', config.limit.toString())
    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    response.headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString())
    
    return addSecurityHeaders(response)
  }
}

export function withValidation<T>(
  handler: (req: NextRequest, data: T) => Promise<NextResponse>,
  schema: any
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const body = await req.json()
      const validation = schema.safeParse(body)
      
      if (!validation.success) {
        const errors = validation.error.errors.map((err: any) => 
          `${err.path.join('.')}: ${err.message}`
        )
        
        return addSecurityHeaders(
          NextResponse.json(
            { error: 'Validation failed', details: errors },
            { status: 400 }
          )
        )
      }
      
      return handler(req, validation.data)
    } catch (error) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Invalid JSON body' },
          { status: 400 }
        )
      )
    }
  }
}

export function withAuth(
  handler: (req: NextRequest, userId: string) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const userId = req.headers.get('x-user-id')
    
    if (!userId) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      )
    }
    
    return handler(req, userId)
  }
}

export function withErrorHandling(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(req)
    } catch (error) {
      console.error('API Error:', error)
      
      return addSecurityHeaders(
        NextResponse.json(
          { 
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' 
              ? (error as Error).message 
              : 'Something went wrong'
          },
          { status: 500 }
        )
      )
    }
  }
}