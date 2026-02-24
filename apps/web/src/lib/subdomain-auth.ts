import { createMiddlewareClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
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
  return createMiddlewareClient({ req, res })
}

export async function createSubdomainRouteHandlerClient(req: NextRequest) {
  const cookieStore = await cookies()
  return createRouteHandlerClient({ cookies: () => cookieStore })
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
