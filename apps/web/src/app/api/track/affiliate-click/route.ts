import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
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
  } catch (error) {
    console.error('Affiliate click tracking error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
