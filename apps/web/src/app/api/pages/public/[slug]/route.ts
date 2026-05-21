import { NextRequest, NextResponse } from 'next/server'
import { createServerRouteClient } from '@/lib/supabase-server'
import { checkSupabase } from '@/lib/check-supabase'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const check = checkSupabase()
  if (check) return check

  try {
    const supabase = await createServerRouteClient()
    const { slug } = await context.params
    const { data: page, error } = await supabase!
      .from('pages')
      .select(`
        *,
        funnels!inner(active)
      `)
      .eq('slug', slug)
      .eq('funnels.active', true)
      .single()

    if (error || !page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    // Parse content JSON
    const content = typeof page.content === 'string' 
      ? JSON.parse(page.content) 
      : page.content

    return NextResponse.json({ 
      page: {
        ...page,
        content
      }
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
