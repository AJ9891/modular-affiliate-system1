import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address')
export const uuidSchema = z.string().uuid('Invalid UUID format')
export const urlSchema = z.string().url('Invalid URL format')

// Funnel validation schemas
export const funnelBlockSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['hero', 'features', 'cta', 'testimonial', 'pricing', 'faq', 'email-capture']),
  content: z.record(z.unknown()),
  style: z.record(z.unknown()).optional(),
})

export const funnelSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  blocks: z.array(funnelBlockSchema).max(20, 'Too many blocks'),
  is_published: z.boolean().optional(),
})

// Lead validation
export const leadCaptureSchema = z.object({
  email: emailSchema,
  funnel_id: uuidSchema.optional(),
  source: z.string().max(50).optional(),
  utm_source: z.string().max(100).optional(),
  utm_medium: z.string().max(100).optional(),
  utm_campaign: z.string().max(100).optional(),
  utm_content: z.string().max(100).optional(),
  utm_term: z.string().max(100).optional(),
})

// Team collaboration validation
export const teamInviteSchema = z.object({
  email: emailSchema,
  role: z.enum(['owner', 'admin', 'editor', 'viewer']),
})

// File upload validation
export const uploadSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  require_email: z.boolean().default(true),
  funnel_id: uuidSchema.optional(),
})

// AI generation validation
export const aiGenerationSchema = z.object({
  prompt: z.string().min(10).max(2000),
  brand_mode: z.enum(['ai_meltdown', 'anti_guru', 'rocket_future']).optional(),
  content_type: z.enum(['headline', 'subcopy', 'full_page', 'email']).optional(),
})

export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      return { success: false, errors }
    }
    return { success: false, errors: ['Invalid input format'] }
  }
}

// Sanitize HTML content
export function sanitizeHtml(content: string): string {
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
}

// Validate file uploads
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png', 
  'image/gif',
  'image/webp',
  'text/plain',
]

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function validateFileUpload(file: File): {
  valid: boolean
  error?: string
} {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not allowed. Allowed: PDF, Word documents, images, and text files.'
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File size exceeds 10MB limit.'
    }
  }

  return { valid: true }
}

// Security headers
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // CSP for the app
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://*.supabase.co https://api.openai.com https://api.sendshark.com https://api.stripe.com",
    "frame-src https://js.stripe.com",
    "media-src 'self'",
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)
  
  return response
}