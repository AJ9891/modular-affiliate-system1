import { NextRequest } from 'next/server'

function parseAllowedOrigins(): Set<string> {
  const configured = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  const defaults = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_BASE_URL,
    'https://launchpad4success.pro',
    'https://www.launchpad4success.pro',
  ].filter((value): value is string => Boolean(value))

  return new Set([...configured, ...defaults])
}

export function buildContentSecurityPolicy() {
  const scriptDirectives =
    process.env.NODE_ENV === 'development'
      ? "'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com"
      : "'self' 'unsafe-inline' https://js.stripe.com"

  return [
    "default-src 'self'",
    `script-src ${scriptDirectives}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://*.supabase.co https://api.openai.com https://api.stripe.com wss://*.supabase.co",
    "frame-src 'self' https://js.stripe.com",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
}

export function resolveAllowedCorsOrigin(request: NextRequest): string | null {
  const origin = request.headers.get('origin')
  if (!origin) return null

  const allowed = parseAllowedOrigins()
  if (allowed.has(origin)) return origin

  const host = request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') || 'https'
  if (host && origin === `${proto}://${host}`) {
    return origin
  }

  return null
}
