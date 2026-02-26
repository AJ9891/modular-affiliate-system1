import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return Response.json(
        { error: 'Supabase service client not configured' },
        { status: 503 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

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
