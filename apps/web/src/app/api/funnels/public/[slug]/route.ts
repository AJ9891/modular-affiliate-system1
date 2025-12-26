import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { checkSupabase } from '@/lib/check-supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const check = checkSupabase()
  if (check) return check

  try {
    const { data: funnel, error } = await supabase!
      .from('funnels')
      .select('*')
      .eq('slug', params.slug)
      .eq('active', true)
      .single()

    if (error || !funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 })
    }

    // Parse blocks JSON
    const blocks = typeof funnel.blocks === 'string' 
      ? JSON.parse(funnel.blocks) 
      : funnel.blocks

    return NextResponse.json({ 
      funnel: {
        ...funnel,
        blocks
      }
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}