import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { checkSupabase } from '@/lib/check-supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { funnelId: string } }
) {
  const check = checkSupabase()
  if (check) return check
  
  try {
    const funnelId = params.funnelId

    // Get clicks
    const { data: clicks, error: clicksError } = await supabase!
      .from('clicks')
      .select('*')
      .eq('funnel_id', funnelId)

    if (clicksError) {
      return NextResponse.json({ error: clicksError.message }, { status: 400 })
    }

    // Get conversions for this funnel's clicks
    const clickIds = clicks.map(c => c.click_id)
    const { data: conversions, error: conversionsError } = await supabase!
      .from('conversions')
      .select('*')
      .in('click_id', clickIds)

    if (conversionsError) {
      return NextResponse.json({ error: conversionsError.message }, { status: 400 })
    }

    // Calculate analytics
    const analytics = {
      total_clicks: clicks.length,
      total_conversions: conversions.length,
      conversion_rate: clicks.length > 0 
        ? ((conversions.length / clicks.length) * 100).toFixed(2)
        : 0,
      total_revenue: conversions.reduce((sum, c) => sum + (c.amount || 0), 0),
      clicks_by_day: groupByDay(clicks),
      conversions_by_day: groupByDay(conversions),
    }

    return NextResponse.json({ analytics }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function groupByDay(items: any[]) {
  return items.reduce((acc, item) => {
    const date = new Date(item.clicked_at || item.converted_at).toISOString().split('T')[0]
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}
