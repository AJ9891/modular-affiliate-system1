import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email/service'
import { createSubdomainRouteHandlerClient } from '@/lib/subdomain-auth'
import { resolveEmailErrorStatus } from '@/lib/email/route-utils'

/**
 * Email Reports API Endpoint
 * POST /api/email/reports/weekly - Send weekly report
 * GET /api/email/reports/stats/:campaignId - Get campaign stats
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSubdomainRouteHandlerClient(request)
    const { recipientEmail, funnelId, dateRange } = await request.json()

    if (!recipientEmail || typeof recipientEmail !== 'string' || !recipientEmail.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid recipientEmail is required' },
        { status: 400 }
      )
    }

    if (!funnelId || typeof funnelId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'funnelId is required' },
        { status: 400 }
      )
    }

    if (!dateRange?.start || !dateRange?.end) {
      return NextResponse.json(
        { success: false, error: 'dateRange.start and dateRange.end are required' },
        { status: 400 }
      )
    }

    // Get funnel analytics from database
    const startDate = new Date(dateRange.start)
    const endDate = new Date(dateRange.end)
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid dateRange values' },
        { status: 400 }
      )
    }

    // Fetch clicks data
    const { data: clicks, error: clicksError } = await supabase
      .from('clicks')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (clicksError) throw clicksError

    // Fetch conversions data
    const { data: conversions, error: conversionsError } = await supabase
      .from('conversions')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (conversionsError) throw conversionsError

    // Calculate stats
    const views = clicks?.length || 0
    const clickCount = clicks?.filter((c: any) => c.funnel_id === funnelId).length || 0
    const conversionCount = conversions?.filter((c: any) => c.funnel_id === funnelId).length || 0
    const revenue = conversions?.reduce((sum: number, c: any) => sum + (c.amount || 0), 0) || 0

    const stats = {
      views,
      clicks: clickCount,
      conversions: conversionCount,
      revenue,
      clickRate: views > 0 ? clickCount / views : 0,
      conversionRate: clickCount > 0 ? conversionCount / clickCount : 0,
    }

    // Send report
    const result = await emailService.sendAnalyticsReport({
      recipientEmail,
      funnelId,
      stats,
      dateRange: { start: startDate, end: endDate },
    })

    return NextResponse.json({ 
      success: true, 
      messageId: result.id,
      stats,
      message: 'Weekly report sent successfully' 
    })
  } catch (err) {
    console.error('Send report error:', err)
    const message = err instanceof Error ? err.message : 'Failed to send report'
    const status = resolveEmailErrorStatus(message)
    return NextResponse.json(
      { 
        success: false, 
        error: message
      },
      { status }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const campaignId = url.searchParams.get('campaignId')

    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID required' },
        { status: 400 }
      )
    }

    const stats = await emailService.getCampaignStats(campaignId)
    
    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error('Get campaign stats error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get stats' 
      },
      { status: 500 }
    )
  }
}
