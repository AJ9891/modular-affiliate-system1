import { NextRequest, NextResponse } from 'next/server'
import { createServerRouteClient } from '@/lib/supabase-server'
import { checkSupabase } from '@/lib/check-supabase'

export const dynamic = 'force-dynamic'

type ApiError = { code?: string; message?: string }

function isMissingTableError(error: ApiError | null | undefined, table: string): boolean {
  if (!error) return false
  if (error.code === 'PGRST205') return true
  return (error.message || '').includes(`Could not find the table 'public.${table}'`)
}

export async function GET(request: NextRequest) {
  try {
    const check = checkSupabase()
    if (check) return check

    const supabase = await createServerRouteClient()
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

    // Resolve funnels owned by the current user. Analytics is scoped by funnel ownership.
    const { data: funnelRows, error: funnelsError } = await supabase
      .from('funnels')
      .select('funnel_id')
      .eq('user_id', user.id)

    if (funnelsError) {
      console.error('Analytics funnels error:', funnelsError)
      return NextResponse.json({ error: 'Failed to resolve funnel access' }, { status: 500 })
    }

    const ownedFunnelIds = (funnelRows || []).map((row: any) => row.funnel_id).filter(Boolean)
    if (ownedFunnelIds.length === 0) {
      return NextResponse.json({
        success: true,
        stats: {
          totalLeads: 0,
          totalClicks: 0,
          totalConversions: 0,
          totalRevenue: 0,
          conversionRate: '0.00',
          avgRevenuePerLead: '0.00',
          emailsSent: 0,
          emailOpenRate: '0.00',
        },
        clicksBySource: {},
        clicksByOffer: {},
        recentClicks: [],
        recentActivity: [],
      })
    }

    const targetFunnelIds = funnelId ? [funnelId] : ownedFunnelIds
    if (funnelId && !ownedFunnelIds.includes(funnelId)) {
      return NextResponse.json({ error: 'Funnel not found or access denied' }, { status: 403 })
    }

    // Load leads/clicks using schema-safe columns.
    const leadsQuery = supabase
      .from('leads')
      .select('id,email,source,funnel_id,created_at')
      .in('funnel_id', targetFunnelIds)
      .gte('created_at', startDate.toISOString())

    const clicksQuery = supabase
      .from('clicks')
      .select('click_id,offer_id,funnel_id,utm_source,user_agent,ip_address,clicked_at')
      .in('funnel_id', targetFunnelIds)
      .gte('clicked_at', startDate.toISOString())

    const [
      { data: leadsData, error: leadsError },
      { data: clicksData, error: clicksError }
    ] = await Promise.all([leadsQuery, clicksQuery])

    if (leadsError && !isMissingTableError(leadsError, 'leads')) {
      console.error('Analytics leads error:', leadsError)
      return NextResponse.json({ error: 'Failed to fetch leads data' }, { status: 500 })
    }

    if (clicksError) {
      console.error('Analytics clicks error:', clicksError)
      return NextResponse.json({ error: 'Failed to fetch clicks data' }, { status: 500 })
    }

    const leads = (isMissingTableError(leadsError, 'leads') ? [] : leadsData) ?? []
    const clicks = clicksData ?? []

    // Conversions are tied to clicks, so fetch by click IDs in range.
    const clickIds = clicks.map((click: any) => click.click_id).filter(Boolean)
    let conversions: any[] = []

    if (clickIds.length > 0) {
      const { data: conversionsData, error: conversionsError } = await supabase
        .from('conversions')
        .select('conversion_id,click_id,amount,order_id,converted_at')
        .in('click_id', clickIds)
        .gte('converted_at', startDate.toISOString())

      if (conversionsError && !isMissingTableError(conversionsError, 'conversions')) {
        console.error('Analytics conversions error:', conversionsError)
        return NextResponse.json({ error: 'Failed to fetch conversions data' }, { status: 500 })
      }

      conversions = (isMissingTableError(conversionsError, 'conversions') ? [] : conversionsData) ?? []
    }

    // Calculate metrics
    const totalLeads = leads.length
    const totalClicks = clicks.length
    const totalConversions = conversions.length
    const totalRevenue = conversions.reduce((sum: number, conversion: any) => sum + Number(conversion.amount || 0), 0)
    
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
      .sort((a: any, b: any) => new Date(b.clicked_at).getTime() - new Date(a.clicked_at).getTime())
      .slice(0, 20)
      .map((click: any) => ({
        type: 'click',
        timestamp: new Date(click.clicked_at),
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

    const recentConversions = conversions
      .sort((a: any, b: any) => new Date(b.converted_at).getTime() - new Date(a.converted_at).getTime())
      .slice(0, 20)
      .map((conversion: any) => ({
        type: 'conversion',
        timestamp: new Date(conversion.converted_at),
        amount: conversion.amount,
        orderId: conversion.order_id,
      }))

    const recentActivity = [...recentClicks, ...recentLeads, ...recentConversions]
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
