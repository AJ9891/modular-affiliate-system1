import { NextRequest, NextResponse } from 'next/server'
import { checkSupabase } from '@/lib/check-supabase'
import { createServiceRoleClient, createServerRouteClient } from '@/lib/supabase-server'
import { canUseCustomDomain, fetchUserProfile, requireUser } from '@/lib/authz'
import { validateDomain } from '@/lib/validators/domains'
import { error, ok, readJson } from '@/lib/http'

export const dynamic = 'force-dynamic'

const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID

// Validate env only when custom-domain provisioning is requested.
function validateCustomDomainEnv() {
  if (!VERCEL_API_TOKEN) {
    throw new Error('[API/DOMAINS] VERCEL_API_TOKEN is required but not set')
  }
  if (!VERCEL_PROJECT_ID) {
    throw new Error('[API/DOMAINS] VERCEL_PROJECT_ID is required but not set')
  }
}

// Get user's domains
export async function GET(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check

  try {
    const supabase = await createServerRouteClient()
    const user = await requireUser(supabase)

    const adminClient = createServiceRoleClient()
    const userData = await fetchUserProfile(
      adminClient,
      user.id,
      'custom_domain, subdomain, subscription_plan, email, is_admin'
    )

    return ok({
      subdomain: userData?.subdomain || null,
      customDomain: userData?.custom_domain || null,
      plan: userData?.subscription_plan || 'starter',
      canAddCustomDomain: canUseCustomDomain(userData)
    })
  } catch (err: unknown) {
    console.error('Error fetching domains:', err)
    return error(err)
  }
}

// Add or update custom domain
export async function POST(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check

  try {
    const supabase = await createServerRouteClient()
    const user = await requireUser(supabase)

    const body = validateDomain(await readJson(request))
    const { domain, type } = body // type: 'subdomain' or 'custom'

    const adminClient = createServiceRoleClient()

    // Get user's subscription plan
    const userData = await fetchUserProfile(
      adminClient,
      user.id,
      'subscription_plan, is_admin'
    )

    if (type === 'custom' && !canUseCustomDomain(userData)) {
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

      return ok({
        success: true,
        subdomain: domain,
        url: `https://${domain}.launchpad4success.pro`
      })
    }

    if (type === 'custom') {
      validateCustomDomainEnv()

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

      return ok({
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

    throw new Error('Invalid domain type')
  } catch (err: unknown) {
    console.error('Error managing domain:', err)
    return error(err)
  }
}
