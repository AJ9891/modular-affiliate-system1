import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { checkSupabase } from '@/lib/check-supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const check = checkSupabase()
    if (check) return check

    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') || '7d'
    const funnelId = searchParams.get('funnelId')
    
    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (range) {
      case '24h':
        startDate.setHours(now.getHours() - 24)
        break
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // Build base query conditions
    let leadsQuery = supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())

    let clicksQuery = supabase
      .from('clicks')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())

    // Filter by funnel if specified
    if (funnelId) {
      leadsQuery = leadsQuery.eq('funnel_id', funnelId)
      clicksQuery = clicksQuery.eq('funnel_id', funnelId)
    }

    // Execute queries
    const [
      { data: leadsData, error: leadsError },
      { data: clicksData, error: clicksError }
    ] = await Promise.all([leadsQuery, clicksQuery])

    const leads = leadsData ?? []
    const clicks = clicksData ?? []

    if (leadsError) {
      console.error('Analytics leads error:', leadsError)
      return NextResponse.json({ error: 'Failed to fetch leads data' }, { status: 500 })
    }

    if (clicksError) {
      console.error('Analytics clicks error:', clicksError)
      return NextResponse.json({ error: 'Failed to fetch clicks data' }, { status: 500 })
    }

    // Calculate metrics
    const totalLeads = leads.length
    const totalClicks = clicks.length
    const totalConversions = leads.filter((lead: any) => lead.converted).length
    const totalRevenue = leads.reduce((sum: number, lead: any) => sum + (lead.revenue || 0), 0)
    
    const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : '0.00'
    const avgRevenuePerLead = totalLeads > 0 ? (totalRevenue / totalLeads).toFixed(2) : '0.00'

    // Group clicks by source
    const clicksBySource = clicks.reduce((acc: any, click: any) => {
      const source = click.utm_source || 'direct'
      acc[source] = (acc[source] || 0) + 1
      return acc
    }, {})

    // Group clicks by offer/funnel
    const clicksByOffer = clicks.reduce((acc: any, click: any) => {
      const offer = click.offer_id || click.funnel_id || 'unknown'
      acc[offer] = (acc[offer] || 0) + 1
      return acc
    }, {})

    // Recent activity (last 20 items)
    const recentClicks = clicks
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 20)
      .map((click: any) => ({
        type: 'click',
        timestamp: new Date(click.created_at),
        source: click.utm_source || 'direct',
        ip: click.ip_address,
        userAgent: click.user_agent
      }))

    const recentLeads = leads
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 20)
      .map((lead: any) => ({
        type: 'lead',
        timestamp: new Date(lead.created_at),
        email: lead.email,
        source: lead.source || 'unknown',
        funnel: lead.funnel_id
      }))

    const recentActivity = [...recentClicks, ...recentLeads]
      .sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 20)

    // Email metrics (placeholder - would need email service integration)
    const emailsSent = 0
    const emailOpenRate = '0.00'

    return NextResponse.json({
      success: true,
      stats: {
        totalLeads,
        totalClicks,
        totalConversions,
        totalRevenue,
        conversionRate,
        avgRevenuePerLead,
        emailsSent,
        emailOpenRate,
      },
      clicksBySource,
      clicksByOffer,
      recentClicks,
      recentActivity,
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
