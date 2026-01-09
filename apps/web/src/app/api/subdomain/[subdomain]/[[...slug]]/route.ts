import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { subdomain: string; slug?: string[] } }
) {
  try {
    const { subdomain } = params
    const slug = params.slug || []
    
    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the subdomain's user data
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        subdomain,
        subscription_plan,
        is_admin,
        funnels (
          id,
          name,
          slug,
          is_published,
          config
        )
      `)
      .eq('subdomain', subdomain)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'Subdomain not found' },
        { status: 404 }
      )
    }

    // If no specific slug, show the default funnel or landing page
    if (slug.length === 0) {
      // Find the default/primary funnel
      const defaultFunnel = user.funnels.find(f => f.is_published) || user.funnels[0]
      
      if (defaultFunnel) {
        // Redirect to the funnel
        return NextResponse.redirect(
          new URL(`/f/${defaultFunnel.slug}`, request.url)
        )
      } else {
        // Show a default coming soon page
        return NextResponse.json({
          message: 'Coming Soon',
          subdomain,
          owner: user.name
        })
      }
    }

    // Handle specific funnel routing
    const funnelSlug = slug[0]
    const funnel = user.funnels.find(f => f.slug === funnelSlug && f.is_published)
    
    if (!funnel) {
      return NextResponse.json(
        { error: 'Funnel not found' },
        { status: 404 }
      )
    }

    // Return funnel data for rendering
    return NextResponse.json({
      funnel,
      owner: {
        id: user.id,
        name: user.name,
        subdomain: user.subdomain
      }
    })

  } catch (error) {
    console.error('Subdomain routing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}