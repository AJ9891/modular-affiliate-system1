import type { NextRequest } from 'next/server'
import Stripe from 'stripe'

const STRIPE_API_VERSION: Stripe.LatestApiVersion = '2025-12-15.clover'
const LOCALHOST_FALLBACK_URL = 'http://localhost:3000'

export function getStripeServerClient() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('Stripe is not configured. Missing STRIPE_SECRET_KEY.')
  }

  return new Stripe(key, {
    apiVersion: STRIPE_API_VERSION,
  })
}

function parseOrigin(value?: string) {
  if (!value) return null

  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

export function resolveAppBaseUrl(request: NextRequest) {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  const forwardedOrigin =
    forwardedHost && forwardedHost.trim().length > 0
      ? `${forwardedProto}://${forwardedHost}`
      : null

  return (
    parseOrigin(forwardedOrigin || undefined) ||
    parseOrigin(request.nextUrl.origin) ||
    parseOrigin(process.env.NEXT_PUBLIC_APP_URL) ||
    parseOrigin(process.env.NEXT_PUBLIC_SITE_URL) ||
    LOCALHOST_FALLBACK_URL
  )
}
