import { NextRequest, NextResponse } from 'next/server'
import { checkSupabase } from '@/lib/check-supabase'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID

// Validate critical env vars upfront
function validateEnv() {
  if (!VERCEL_API_TOKEN) {
    throw new Error('[API/DOMAINS] VERCEL_API_TOKEN is required but not set')
  }
  if (!VERCEL_PROJECT_ID) {
    throw new Error('[API/DOMAINS] VERCEL_PROJECT_ID is required but not set')
  }
  if (!VERCEL_TEAM_ID) {
    throw new Error('[API/DOMAINS] VERCEL_TEAM_ID is required but not set')
  }
}

// Get user's domains
export async function GET(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check

  try {
    validateEnv()
    const supabase = createRouteHandlerClient({ cookies })
    const accessToken = request.cookies.get('sb-access-token')?.value
    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: { user } } = await supabase.auth.getUser(accessToken)
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Get user's custom domains from database
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    if (!supabaseUrl) throw new Error('[API/DOMAINS] NEXT_PUBLIC_SUPABASE_URL is required')
    if (!serviceRoleKey) throw new Error('[API/DOMAINS] SUPABASE_SERVICE_ROLE_KEY is required')

    const { createClient } = await import('@supabase/supabase-js')
    const adminClient = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data: userData } = await adminClient
      .from('users')
      .select('custom_domain, subdomain, subscription_plan, email, is_admin')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      subdomain: userData?.subdomain || null,
      customDomain: userData?.custom_domain || null,
      plan: userData?.subscription_plan || 'starter',
      canAddCustomDomain: userData?.is_admin || userData?.subscription_plan === 'agency'
    })
  } catch (error: any) {
    console.error('Error fetching domains:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Add or update custom domain
export async function POST(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check

  try {
    validateEnv()
    const supabase = createRouteHandlerClient({ cookies })
    const accessToken = request.cookies.get('sb-access-token')?.value
    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: { user } } = await supabase.auth.getUser(accessToken)
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const body = await request.json()
    const { domain, type } = body // type: 'subdomain' or 'custom'

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    if (!supabaseUrl) throw new Error('[API/DOMAINS] NEXT_PUBLIC_SUPABASE_URL is required')
    if (!serviceRoleKey) throw new Error('[API/DOMAINS] SUPABASE_SERVICE_ROLE_KEY is required')

    const { createClient } = await import('@supabase/supabase-js')
    const adminClient = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get user's subscription plan
    const { data: userData } = await adminClient
      .from('users')
      .select('subscription_plan, is_admin')
      .eq('id', user.id)
      .single()

    if (type === 'custom' && !userData?.is_admin && userData?.subscription_plan !== 'agency') {
      return NextResponse.json(
        { error: 'Custom domains are only available on Agency plan' },
        { status: 403 }
      )
    }

    if (type === 'subdomain') {
      // Validate subdomain format
      const subdomainRegex = /^[a-z0-9-]+$/
      if (!subdomainRegex.test(domain)) {
        return NextResponse.json(
          { error: 'Subdomain must contain only lowercase letters, numbers, and hyphens' },
          { status: 400 }
        )
      }

      // Check if subdomain is already taken
      const { data: existing } = await adminClient
        .from('users')
        .select('id')
        .eq('subdomain', domain)
        .neq('id', user.id)
        .single()

      if (existing) {
        return NextResponse.json(
          { error: 'This subdomain is already taken' },
          { status: 400 }
        )
      }

      // Update user's subdomain
      await adminClient
        .from('users')
        .update({ subdomain: domain })
        .eq('id', user.id)

      return NextResponse.json({
        success: true,
        subdomain: domain,
        url: `https://${domain}.launchpad4success.pro`
      })
    }

    if (type === 'custom') {
      // Add domain to Vercel via API
      if (!VERCEL_API_TOKEN || !VERCEL_PROJECT_ID) {
        return NextResponse.json(
          { error: 'Vercel API not configured. Please contact support.' },
          { status: 503 }
        )
      }

      const vercelUrl = VERCEL_TEAM_ID
        ? `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains?teamId=${VERCEL_TEAM_ID}`
        : `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains`

      const vercelResponse = await fetch(vercelUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${VERCEL_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: domain })
      })

      const vercelData = await vercelResponse.json()

      if (!vercelResponse.ok) {
        console.error('Vercel API error:', vercelData)
        return NextResponse.json(
          { error: vercelData.error?.message || 'Failed to add domain to Vercel' },
          { status: vercelResponse.status }
        )
      }

      // Update user's custom domain in database
      await adminClient
        .from('users')
        .update({ custom_domain: domain })
        .eq('id', user.id)

      return NextResponse.json({
        success: true,
        domain,
        vercelConfig: vercelData,
        instructions: {
          message: 'Domain added! Please configure your DNS settings:',
          records: [
            {
              type: 'A',
              name: '@',
              value: '76.76.21.21'
            },
            {
              type: 'CNAME',
              name: 'www',
              value: 'cname.vercel-dns.com'
            }
          ]
        }
      })
    }

    return NextResponse.json(
      { error: 'Invalid domain type' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Error managing domain:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
