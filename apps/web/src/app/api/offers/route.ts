import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { checkSupabase } from '@/lib/check-supabase'

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

    const { data, error } = await supabase!
      .from('offers')
      .insert({
        name,
        description,
        affiliate_link,
        commission_rate,
        niche_id,
        is_active: true,
      })
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ offer: data[0] }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
