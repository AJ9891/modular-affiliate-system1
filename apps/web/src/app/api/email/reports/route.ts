import { NextRequest, NextResponse } from 'next/server'
import { sendshark } from '@/lib/sendshark'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * Email Reports API Endpoint
 * POST /api/email/reports/weekly - Send weekly report
 * GET /api/email/reports/stats/:campaignId - Get campaign stats
 */
export async function POST(request: NextRequest) {
  try {
    const { recipientEmail, funnelId, dateRange } = await request.json()

    // Get funnel analytics from database
    const startDate = new Date(dateRange.start)
    const endDate = new Date(dateRange.end)

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
    const result = await sendshark.sendAnalyticsReport({
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
  } catch (error) {
    console.error('Send report error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send report' 
      },
      { status: 500 }
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

    const stats = await sendshark.getCampaignStats(campaignId)
    
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
