import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
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
  
  const supabaseClient = createRouteHandlerClient({ cookies })
  
  try {
    // Get user from session using Supabase auth-helpers
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

    console.log('User from session:', user?.id, 'Auth error:', authError)

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Create admin client for operations
    const { createClient } = await import('@supabase/supabase-js')
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Ensure user exists in public.users table
    const { data: existingUser } = await adminClient
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    console.log('Existing user:', existingUser?.id)

    if (!existingUser) {
      console.log('Creating user in public.users table')
      // Create user in public.users table
      const { error: userCreateError } = await adminClient
        .from('users')
        .insert({
          id: user.id,
          email: user.email || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (userCreateError) {
        console.error('Error creating user:', userCreateError)
      }
    }

    const body = await request.json()
    const { name, template, niche, blocks, theme, slug } = body

    console.log('Received funnel data:', { name, template, niche, blocks: blocks?.length, theme, slug })

    if (!name) {
      return NextResponse.json({ error: 'Funnel name is required' }, { status: 400 })
    }

    // Store all funnel configuration in blocks JSON
    const blocksData = {
      template: template || 'custom',
      niche: niche || 'general',
      theme: theme || {
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        fontFamily: 'Inter'
      },
      blocks: blocks || []
    }

    console.log('Inserting funnel with blocks data:', JSON.stringify(blocksData).substring(0, 200))

    const { data, error } = await adminClient
      .from('funnels')
      .insert({
        user_id: user.id,
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        blocks: blocksData,  // Supabase will handle JSON automatically
        created_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Error creating funnel:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('Funnel created successfully:', data[0]?.funnel_id)

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
