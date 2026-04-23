import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

interface SubdomainInfo {
  subdomain: string | null
  isSubdomain: boolean
  host: string
}

export function parseSubdomain(request: NextRequest): SubdomainInfo {
  const host = request.headers.get('host') || ''
  
  // Check if this is a subdomain of launchpad4success.pro
  const subdomainMatch = host.match(/^([^.]+)\.launchpad4success\.pro$/)
  
  if (subdomainMatch && subdomainMatch[1] !== 'www') {
    return {
      subdomain: subdomainMatch[1],
      isSubdomain: true,
      host
    }
  }
  
  return {
    subdomain: null,
    isSubdomain: false,
    host
  }
}

export function createSubdomainMiddlewareClient(req: NextRequest, res: NextResponse) {
  const supabasePublicKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl || !supabasePublicKey) {
    // Returning null allows callers to bypass auth when env is not configured (e.g., local preview)
    // Callers must check for null before using the client.
    return null
  }

  return createServerClient(supabaseUrl, supabasePublicKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
        cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
      },
    },
  })
}

export async function createSubdomainRouteHandlerClient(_req: NextRequest) {
  const supabasePublicKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!supabaseUrl || !supabasePublicKey) {
    throw new Error('[Supabase] NEXT_PUBLIC_SUPABASE_URL and public key missing')
  }

  const cookieStore = await cookies()
  return createServerClient(supabaseUrl, supabasePublicKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Ignore writes in contexts that disallow cookie mutation.
        }
      },
    },
  })
}

// Next.js 16-compatible route handler client for routes that previously used
// createRouteHandlerClient({ cookies }) directly.
export async function createRouteHandlerClientCompat() {
  const supabasePublicKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!supabaseUrl || !supabasePublicKey) {
    throw new Error('[Supabase] NEXT_PUBLIC_SUPABASE_URL and public key missing')
  }

  const cookieStore = await cookies()
  return createServerClient(supabaseUrl, supabasePublicKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Ignore writes in contexts that disallow cookie mutation.
        }
      },
    },
  })
}

export async function validateSubdomainAccess(
  subdomain: string,
  userId?: string
): Promise<{ valid: boolean; owner?: any; error?: string }> {
  try {
    // Create admin client to check subdomain ownership
    const { createClient } = await import('@supabase/supabase-js')
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { valid: false, error: 'Configuration error' }
    }
    
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data: owner, error } = await adminClient
      .from('users')
      .select('*')
      .eq('subdomain', subdomain)
      .single()

    if (error || !owner) {
      return { valid: false, error: 'Subdomain not found' }
    }

    return { valid: true, owner }
  } catch (error) {
    console.error('Subdomain validation error:', error)
    return { valid: false, error: 'Validation failed' }
  }
}

export function getSubdomainRedirectUrl(request: NextRequest, path: string): string {
  const { isSubdomain, subdomain } = parseSubdomain(request)
  
  if (isSubdomain && subdomain) {
    return `https://${subdomain}.launchpad4success.pro${path}`
  }
  
  return `${request.nextUrl.origin}${path}`
}
