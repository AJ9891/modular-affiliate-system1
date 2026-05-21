import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClientCompat } from '@/lib/subdomain-auth'
import { checkSupabase } from '@/lib/check-supabase'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const check = checkSupabase()
  if (check) return check

  try {
    const supabase = await createRouteHandlerClientCompat()
    const { slug } = await context.params
    const { data: funnel, error } = await supabase!
      .from('funnels')
      .select('*')
      .eq('slug', slug)
      .eq('active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 })
    }

    let blocks = funnel.blocks
    if (typeof blocks === 'string') {
      try {
        blocks = JSON.parse(blocks)
      } catch {
        blocks = { blocks: [] }
      }
    }

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
