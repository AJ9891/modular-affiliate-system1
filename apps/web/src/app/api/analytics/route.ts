import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { checkSupabase } from '@/lib/check-supabase'

export async function GET(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check

  try {
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
      default:
        startDate = new Date('2020-01-01') // All time
    }

    // Build base query for clicks
    let clicksQuery = supabase!
      .from('clicks')
      .select('*')
      .gte('clicked_at', startDate.toISOString())

    if (funnelId) {
      clicksQuery = clicksQuery.eq('funnel_id', funnelId)
    }

    // Get all clicks
    const { data: clicks, error: clicksError } = await clicksQuery

    if (clicksError) {
      return NextResponse.json({ error: clicksError.message }, { status: 400 })
    }

    // Get all conversions
    const { data: conversions, error: conversionsError } = await supabase!
      .from('conversions')
      .select('*')
      .gte('converted_at', startDate.toISOString())

    if (conversionsError) {
      return NextResponse.json({ error: conversionsError.message }, { status: 400 })
    }

    // Calculate total stats
    const totalClicks = clicks?.length || 0
    const totalConversions = conversions?.length || 0
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0
    const totalRevenue = conversions?.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0) || 0

    // Group clicks by source
    const clicksBySource = clicks?.reduce((acc: any[], click) => {
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
    clicksBySource.sort((a, b) => b.count - a.count)

    // Get offers data for click/conversion breakdown
    const { data: offers } = await supabase!
      .from('offers')
      .select('id, name')

    const clicksByOffer = offers?.map(offer => {
      const offerClicks = clicks?.filter(c => c.offer_id === offer.id).length || 0
      const offerConversions = conversions?.filter(c => c.offer_id === offer.id).length || 0
      
      return {
        offer_name: offer.name,
        clicks: offerClicks,
        conversions: offerConversions,
      }
    }).filter(item => item.clicks > 0) || []

    // Get recent clicks (last 20)
    const recentClicks = clicks
      ?.sort((a, b) => new Date(b.clicked_at).getTime() - new Date(a.clicked_at).getTime())
      .slice(0, 20)
      .map(click => ({
        clicked_at: click.clicked_at,
        offer_id: click.offer_id,
        utm_source: click.utm_source,
        utm_medium: click.utm_medium,
        utm_campaign: click.utm_campaign,
      })) || []

    return NextResponse.json({
      totalClicks,
      totalConversions,
      conversionRate,
      totalRevenue,
      clicksBySource,
      clicksByOffer,
      recentClicks,
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
