import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { checkSupabase } from '@/lib/check-supabase'

export async function GET(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check
  
  try {
    const { data: funnels, error } = await supabase!
      .from('funnels')
      .select('*')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ funnels }, { status: 200 })
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
    // Get user from session
    const accessToken = request.cookies.get('sb-access-token')?.value
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Create an authenticated Supabase client with the user's token
    const { createClient } = await import('@supabase/supabase-js')
    const userSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      }
    )

    const { data: { user }, error: authError } = await userSupabase.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Ensure user exists in public.users table
    const { data: existingUser } = await userSupabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingUser) {
      // Create user in public.users table
      await userSupabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
    }

    const body = await request.json()
    const { name, template, niche, blocks } = body

    if (!name) {
      return NextResponse.json({ error: 'Funnel name is required' }, { status: 400 })
    }

    // Store template and niche info in the blocks JSON since schema uses niche_id (UUID)
    const blocksData = {
      template: template || 'custom',
      niche: niche || 'general',
      blocks: blocks || []
    }

    const { data, error } = await userSupabase
      .from('funnels')
      .insert({
        user_id: user.id,
        name,
        blocks: JSON.stringify(blocksData),
        created_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Error creating funnel:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ 
      funnel: data[0],
      funnelId: data[0].funnel_id 
    }, { status: 201 })
  } catch (error: any) {
    console.error('Funnel creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
