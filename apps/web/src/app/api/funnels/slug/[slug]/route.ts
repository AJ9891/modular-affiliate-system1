import { NextRequest, NextResponse } from 'next/server'
import { checkSupabase } from '@/lib/check-supabase'
import { createRouteHandlerClientCompat } from '@/lib/subdomain-auth'
import { getRouteUser } from '@/lib/auth/session'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const check = checkSupabase()
  if (check) return check

  try {
    const userSupabase = await createRouteHandlerClientCompat()
    const { user, response } = await getRouteUser(userSupabase, 'Not authenticated')
    if (!user) return response!

    const { slug } = await context.params
    const { data: funnel, error } = await userSupabase
      .from('funnels')
      .select('*')
      .eq('slug', slug)
      .eq('user_id', user.id)
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
