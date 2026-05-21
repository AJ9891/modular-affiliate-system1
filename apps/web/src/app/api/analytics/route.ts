import { NextResponse } from 'next/server'
import { withRouteHandler } from '@/features/shared/api/route-handler'
import { getAnalyticsSummary } from '@/features/analytics/server/analytics-summary.service'

export const dynamic = 'force-dynamic'

export const GET = withRouteHandler(async ({ request, supabase, user }) => {
  const searchParams = request.nextUrl.searchParams
  const range = searchParams.get('range') || '7d'
  const funnelId = searchParams.get('funnelId')

  try {
    const { payload, cache } = await getAnalyticsSummary(supabase, {
      userId: user!.id,
      range,
      funnelId,
    })

    return NextResponse.json(payload, {
      headers: {
        'X-Cache': cache,
      },
    })
  } catch (error) {
    console.error('Analytics summary failed, returning degraded payload:', error)

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalLeads: 0,
          totalClicks: 0,
          totalConversions: 0,
          totalRevenue: 0,
          conversionRate: 0,
          avgRevenuePerLead: 0,
          emailsSent: 0,
          emailOpenRate: 0,
        },
        clicksBySource: {},
        clicksByOffer: {},
        recentClicks: [],
        recentActivity: [],
      },
      {
        headers: {
          'X-Cache': 'MISS',
          'X-Analytics-Degraded': '1',
        },
      },
    )
  }
})
