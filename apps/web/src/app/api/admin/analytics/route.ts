import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
    .maybeSingle()
  
  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  try {
    // Monthly cost per provider & totals
    const { data: costSummary } = await supabase.rpc('usage_summary')
    
    // Top AI users (optional pre-made function)
    const { data: topUsers } = await supabase.rpc('top_ai_users', { limit: 10 })

    // Quick example queries - aggregate by provider
    const { data: totals } = await supabase
      .from('image_usage')
      .select('provider, cost, id', { count: 'exact' })

    // Calculate totals per provider
    const providerTotals = totals?.reduce((acc: any, row: any) => {
      if (!acc[row.provider]) {
        acc[row.provider] = { provider: row.provider, total_cost: 0, requests: 0 }
      }
      acc[row.provider].total_cost += row.cost || 0
      acc[row.provider].requests += 1
      return acc
    }, {})

    const groupedTotals = providerTotals ? Object.values(providerTotals) : []

    return NextResponse.json({ 
      totals: groupedTotals, 
      costSummary, 
      topUsers 
    }, { status: 200 })
  } catch (err: any) {
    console.error('Admin analytics error:', err)
    return NextResponse.json(
      { error: err.message || 'Error fetching analytics' },
      { status: 500 }
    )
  }
}
