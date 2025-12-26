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
    const { data: page, error } = await supabase!
      .from('pages')
      .select(`
        *,
        funnels!inner(active)
      `)
      .eq('slug', params.slug)
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