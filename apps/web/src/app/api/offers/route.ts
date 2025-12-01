import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { checkSupabase } from '@/lib/check-supabase'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const check = checkSupabase()
  if (check) return check

  try {
    const { data, error } = await supabase!
      .from('offers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ offers: data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check

  try {
    const body = await request.json()
    const { name, description, affiliate_link, commission_rate, niche_id } = body

    console.log('Creating offer:', { name, description, affiliate_link, commission_rate, niche_id })

    // Use service role client to bypass RLS
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data, error } = await adminClient
      .from('offers')
      .insert({
        name,
        description,
        affiliate_link,
        commission_rate,
        niche_id,
        active: true,
      })
      .select()

    if (error) {
      console.error('Error creating offer:', error)
      return NextResponse.json({ error: error.message, details: error }, { status: 400 })
    }

    console.log('Offer created successfully:', data)
    return NextResponse.json({ offer: data[0] }, { status: 201 })
  } catch (error: any) {
    console.error('Exception creating offer:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
