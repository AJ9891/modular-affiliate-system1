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

    // Validate user ID format
    if (!user.id || typeof user.id !== 'string' || user.id === 'new') {
      console.error('Invalid user ID:', user.id)
      return NextResponse.json({ error: 'Invalid user session' }, { status: 401 })
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

    console.log('Received funnel data:', { 
      name, 
      template, 
      niche, 
      blocks: blocks?.length, 
      theme, 
      slug,
      rawBody: JSON.stringify(body).substring(0, 300)
    })

    if (!name) {
      return NextResponse.json({ error: 'Funnel name is required' }, { status: 400 })
    }

    // Check for any "new" values in the data
    const checkForNew = (obj: any, path = ''): void => {
      if (typeof obj === 'string' && obj === 'new') {
        console.error(`Found "new" value at path: ${path}`)
      } else if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach(key => {
          checkForNew(obj[key], `${path}.${key}`)
        })
      }
    }
    checkForNew(body, 'body')

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

    // Ensure slug is unique and avoid "new" keyword issues
    let baseSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'untitled-funnel'
    
    // If slug contains "new", replace it to avoid PostgreSQL keyword conflicts
    if (baseSlug.includes('new')) {
      console.log('Slug contains "new", replacing with "custom":', baseSlug);
      baseSlug = baseSlug.replace(/new/g, 'custom');
    }
    
    const insertData = {
      user_id: user.id,
      name,
      slug: baseSlug,
      blocks: blocksData,
      active: true,
      niche_id: null, // Set niche_id to null for now since we don't have niche management
      status: 'draft', // Add status field that might be required
      team_id: null, // Add team_id field that might be required
      brand_mode: null, // Add brand_mode field that might be required
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('About to insert funnel:', {
      user_id: insertData.user_id,
      name: insertData.name,
      slug: insertData.slug,
      blocksLength: Array.isArray(blocksData.blocks) ? blocksData.blocks.length : 'not array',
      active: insertData.active,
      status: insertData.status,
      team_id: insertData.team_id,
      brand_mode: insertData.brand_mode,
      niche_id: insertData.niche_id,
      fullInsertData: JSON.stringify(insertData, null, 2)
    })
    
    const { data, error } = await adminClient
      .from('funnels')
      .insert(insertData)
      .select('funnel_id, user_id, name, slug, blocks, active, created_at, updated_at')

    if (error) {
      console.error('Error creating funnel:', error)
      console.error('Error details - code:', error.code, 'message:', error.message, 'hint:', error.hint)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data || data.length === 0) {
      console.error('No data returned from insert')
      return NextResponse.json({ error: 'Failed to create funnel' }, { status: 400 })
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
