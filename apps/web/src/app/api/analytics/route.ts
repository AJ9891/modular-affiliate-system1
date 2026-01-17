import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { checkSupabase } from '@/lib/check-supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check

  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') || '7d'
    const funnelId = searchParams.get('funnelId')

    // Calculate date range
    const now = new Date()
    let startDate: Date
    
    switch (range) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date('2020-01-01') // All time
    }

    // Build base query for clicks
    let clicksQuery = supabase!
      .from('clicks')
      .select('*')
      .gte('clicked_at', startDate.toISOString())

    if (funnelId && funnelId !== 'all') {
      clicksQuery = clicksQuery.eq('funnel_id', funnelId)
    }

    // Get all clicks
    const { data: clicks, error: clicksError } = await clicksQuery

    if (clicksError) {
      return NextResponse.json({ error: clicksError.message }, { status: 400 })
    }

    // Get all conversions
    let conversionsQuery = supabase!
      .from('conversions')
      .select('*')
      .gte('converted_at', startDate.toISOString())

    if (funnelId && funnelId !== 'all') {
      // Get click IDs from this funnel
      const funnelClickIds = clicks?.map((c: any) => c.click_id) || []
      if (funnelClickIds.length > 0) {
        conversionsQuery = conversionsQuery.in('click_id', funnelClickIds)
      }
    }

    const { data: conversions, error: conversionsError } = await conversionsQuery

    if (conversionsError) {
      return NextResponse.json({ error: conversionsError.message }, { status: 400 })
    }

    // Get leads data
    let leadsQuery = supabase!
      .from('leads')
      .select('*')
      .gte('created_at', startDate.toISOString())

    if (funnelId && funnelId !== 'all') {
      leadsQuery = leadsQuery.eq('funnel_id', funnelId)
    }

    const { data: leads } = await leadsQuery

    // Calculate total stats
    const totalClicks = clicks?.length || 0
    const totalConversions = conversions?.length || 0
    const totalLeads = leads?.length || 0
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) : 0
    const totalRevenue = conversions?.reduce((sum: number, c: any) => sum + (parseFloat(c.amount) || 0), 0) || 0
    const avgRevenuePerLead = totalLeads > 0 ? totalRevenue / totalLeads : 0

    // Mock email stats (replace with actual Sendshark data when integrated)
    const emailsSent = totalLeads * 3 // Assume 3 emails per lead
    const emailOpenRate = 0.35 // 35% open rate

    // Group clicks by source
    const clicksBySource = clicks?.reduce((acc: any[], click: any) => {
      const source = click.utm_source || 'direct'
      const existing = acc.find(item => item.source === source)
      if (existing) {
        existing.count++
      } else {
        acc.push({ source, count: 1 })
      }
      return acc
    }, []) || []

    // Sort by count
    clicksBySource.sort((a: any, b: any) => b.count - a.count)

    // Get offers data for click/conversion breakdown
    const { data: offers } = await supabase!
      .from('offers')
      .select('id, name')

    const clicksByOffer = offers?.map((offer: any) => {
      const offerClicks = clicks?.filter((c: any) => c.offer_id === offer.id).length || 0
      const offerConversions = conversions?.filter((c: any) => c.offer_id === offer.id).length || 0
      
      return {
        offer_name: offer.name,
        clicks: offerClicks,
        conversions: offerConversions,
      }
    }).filter((item: any) => item.clicks > 0) || []

    // Get recent clicks (last 20)
    const recentClicks = clicks
      ?.sort((a: any, b: any) => new Date(b.clicked_at).getTime() - new Date(a.clicked_at).getTime())
      .slice(0, 20)
      .map((click: any) => ({
        clicked_at: click.clicked_at,
        offer_id: click.offer_id,
        utm_source: click.utm_source,
        utm_medium: click.utm_medium,
        utm_campaign: click.utm_campaign,
      })) || []

    // Build recent activity feed
    const recentActivity: any[] = []

    // Add recent leads
    leads?.slice(0, 10).forEach((lead: any) => {
      recentActivity.push({
        id: lead.id,
        type: 'lead',
        description: `New lead: ${lead.email}`,
        timestamp: new Date(lead.created_at),
      })
    })

    // Add recent conversions
    conversions?.slice(0, 10).forEach((conversion: any) => {
      recentActivity.push({
        id: conversion.conversion_id,
        type: 'conversion',
        description: `New conversion`,
        timestamp: new Date(conversion.converted_at),
        amount: parseFloat(conversion.amount || 0),
      })
    })

    // Sort by timestamp
    recentActivity.sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime())

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
      recentActivity: recentActivity.slice(0, 20),
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
