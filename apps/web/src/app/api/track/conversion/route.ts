import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const cookieAdapter = (() => cookieStore) as unknown as () => ReturnType<typeof cookies>
  const supabase = createRouteHandlerClient({ cookies: cookieAdapter })
  
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { offer_id, amount, order_id, funnel_id, generation_id, variant_id } = body

    // Get click ID from cookie for attribution
    const click_id = cookieStore.get('aff_click_id')?.value
    const {
      data: { user: sessionUser },
    } = await supabase.auth.getUser()

    let ownerUserId: string | null = sessionUser?.id || null
    let ownerFunnelId: string | null = funnel_id || null
    let ownerGenerationId: string | null = generation_id || null
    let ownerVariantId: string | null = variant_id || null

    if (click_id) {
      const { data: clickData } = await supabase
        .from('clicks')
        .select('user_id,funnel_id,generation_id,variant_id')
        .eq('click_id', click_id)
        .maybeSingle()

      if (clickData) {
        ownerUserId = clickData.user_id || ownerUserId
        ownerFunnelId = clickData.funnel_id || ownerFunnelId
        ownerGenerationId = clickData.generation_id || ownerGenerationId
        ownerVariantId = clickData.variant_id || ownerVariantId
      }
    }

    const { data, error } = await supabase
      .from('conversions')
      .insert({
        conversion_id: crypto.randomUUID(),
        user_id: ownerUserId,
        click_id: click_id || null,
        offer_id,
        funnel_id: ownerFunnelId,
        generation_id: ownerGenerationId,
        variant_id: ownerVariantId,
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
