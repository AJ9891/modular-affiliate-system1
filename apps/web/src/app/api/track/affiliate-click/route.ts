import { NextRequest } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createServiceRoleClient()

    const { user_id, partner, source, metadata } = await req.json()

    if (!partner) {
      return Response.json({ error: 'Partner is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('affiliate_clicks')
      .insert({
        user_id: user_id || null,
        partner,
        source: source || 'unknown',
        metadata: metadata || {},
      })
      .select()
      .single()

    if (error) {
      console.error('Affiliate click tracking error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true, click: data })
  } catch (error: any) {
    console.error('Affiliate click tracking error:', error)
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
