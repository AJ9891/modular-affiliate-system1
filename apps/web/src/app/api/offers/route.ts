import { NextRequest, NextResponse } from 'next/server'
import { checkSupabase } from '@/lib/check-supabase'
import { createServiceRoleClient, createServerRouteClient } from '@/lib/supabase-server'
import { requireUser } from '@/lib/authz'

export async function GET() {
  const check = checkSupabase()
  if (check) return check

  try {
    const supabase = await createServerRouteClient()
    await requireUser(supabase) // ensure caller is authenticated
    const { data, error } = await supabase!
      .from('offers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ offers: data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status ?? 500 }
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
    const adminClient = createServiceRoleClient()

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
      { status: error.status ?? 500 }
    )
  }
}
