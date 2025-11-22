import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { offer_id, amount, order_id } = body

    // Get click ID from cookie for attribution
    const cookieStore = cookies()
    const click_id = cookieStore.get('aff_click_id')?.value

    const { data, error } = await supabase
      .from('conversions')
      .insert({
        conversion_id: crypto.randomUUID(),
        click_id: click_id || null,
        offer_id,
        amount,
        order_id,
        converted_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ 
      conversion: data[0],
      tracked: true 
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
