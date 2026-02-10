import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { checkSupabase } from '@/lib/check-supabase'

export async function GET(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check
  
  try {
    const supabase = createRouteHandlerClient({ cookies })
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
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  if (isDevelopment) {
    console.log('[FUNNELS API] POST request initiated')
  }
  
  const check = checkSupabase()
  if (check) return check
  
  const supabaseClient = createRouteHandlerClient({ cookies })
  
  try {
    // Get user from session using Supabase auth-helpers
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

    if (isDevelopment) {
      console.log('[FUNNELS API] User from session:', user?.id, 'Auth error:', authError)
    }

    if (authError || !user) {
      if (isDevelopment) {
        console.error('[FUNNELS API] Authentication failed:', authError)
      }
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Validate user ID format
    if (!user.id || typeof user.id !== 'string' || user.id === 'new') {
      console.error('[FUNNELS API] Invalid user ID:', user.id)
      return NextResponse.json({ error: 'Invalid user session' }, { status: 401 })
    }

    // Parse and validate request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('[FUNNELS API] JSON parse error:', parseError)
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    const { name, template, niche, blocks, theme, slug } = body

    if (isDevelopment) {
      console.log('[FUNNELS API] Received funnel data:', { 
        name, 
        template, 
        niche, 
        blocks: Array.isArray(blocks) ? blocks.length : 'not array', 
        theme: !!theme, 
        slug,
        bodyKeys: Object.keys(body)
      })
    }

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Funnel name is required and must be a non-empty string' }, { status: 400 })
    }

    if (!Array.isArray(blocks)) {
      return NextResponse.json({ error: 'Blocks must be an array' }, { status: 400 })
    }

    // Comprehensive data sanitization to prevent 'new' keyword issues
    const sanitizeData = (obj: any): any => {
      if (typeof obj === 'string') {
        return obj === 'new' ? 'custom' : obj
      } else if (Array.isArray(obj)) {
        return obj.map(sanitizeData)
      } else if (obj && typeof obj === 'object') {
        const sanitized: any = {}
        for (const [key, value] of Object.entries(obj)) {
          // Skip any keys that are 'new' or 'id' for blocks
          if (key === 'new' || (key === 'id' && typeof value === 'string' && (value === 'new' || value.includes('block-')))) {
            continue
          }
          sanitized[key] = sanitizeData(value)
        }
        return sanitized
      }
      return obj
    }

    const sanitizedBlocks = sanitizeData(blocks)
    const sanitizedTheme = sanitizeData(theme) || {
      primaryColor: '#667eea',
      secondaryColor: '#764ba2',
      fontFamily: 'Inter'
    }

    if (isDevelopment) {
      console.log('[FUNNELS API] Data after sanitization:', {
        originalBlocksCount: blocks.length,
        sanitizedBlocksCount: sanitizedBlocks.length,
        hasTheme: !!sanitizedTheme
      })
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

    if (isDevelopment) {
      console.log('[FUNNELS API] Existing user check:', existingUser?.id)
    }

    if (!existingUser) {
      if (isDevelopment) {
        console.log('[FUNNELS API] Creating user in public.users table')
      }
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
        console.error('[FUNNELS API] Error creating user:', userCreateError)
        // Continue anyway - user might already exist from a different process
      }
    }

    // Store all funnel configuration in blocks JSON
    const blocksData = {
      template: sanitizeData(template) || 'custom',
      niche: sanitizeData(niche) || 'general',
      theme: sanitizedTheme,
      blocks: sanitizedBlocks
    }

    if (isDevelopment) {
      console.log('[FUNNELS API] Preparing blocks data:', {
        template: blocksData.template,
        niche: blocksData.niche,
        blocksCount: blocksData.blocks.length,
        hasTheme: !!blocksData.theme
      })
    }

    // Generate unique slug - handle duplicates
    let baseSlug = sanitizeData(slug) || sanitizeData(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `funnel-${Date.now()}`
    
    // Extra safety - replace any remaining 'new' occurrences
    if (baseSlug.includes('new')) {
      console.log('[FUNNELS API] Slug contains "new", replacing with "custom":', baseSlug)
      baseSlug = baseSlug.replace(/new/g, 'custom')
    }

    // Check for existing slugs and make unique
    let uniqueSlug = baseSlug
    let counter = 1
    let slugExists = true

    while (slugExists) {
      const { data: existingFunnel } = await adminClient
        .from('funnels')
        .select('slug')
        .eq('user_id', user.id)
        .eq('slug', uniqueSlug)
        .single()

      if (!existingFunnel) {
        slugExists = false
      } else {
        uniqueSlug = `${baseSlug}-${counter}`
        counter++
        
        if (isDevelopment) {
          console.log('[FUNNELS API] Slug exists, trying:', uniqueSlug)
        }
      }
    }

    if (isDevelopment) {
      console.log('[FUNNELS API] Final unique slug:', uniqueSlug)
    }

    const insertData = {
      user_id: user.id,
      name: sanitizeData(name).trim(),
      slug: uniqueSlug,
      blocks: blocksData,
      active: true,
      niche_id: null, // Set niche_id to null for now since we don't have niche management
      status: 'draft',
      team_id: null,
      brand_mode: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Final validation - ensure no 'new' values in the insert data
    const insertDataStr = JSON.stringify(insertData)
    if (insertDataStr.includes('"new"')) {
      console.error('[FUNNELS API] Insert data still contains "new" values:', insertDataStr.substring(0, 500))
      return NextResponse.json({ error: 'Data validation failed: Invalid values detected' }, { status: 400 })
    }

    if (isDevelopment) {
      console.log('[FUNNELS API] About to insert funnel:', {
        user_id: insertData.user_id,
        name: insertData.name,
        slug: insertData.slug,
        blocksDataSize: JSON.stringify(insertData.blocks).length,
        active: insertData.active,
        status: insertData.status
      })
    }
    
    const { data, error } = await adminClient
      .from('funnels')
      .insert(insertData)
      .select('funnel_id, user_id, name, slug, blocks, active, created_at, updated_at')

    if (error) {
      console.error('[FUNNELS API] Database insertion error:', {
        code: error.code,
        message: error.message,
        hint: error.hint,
        details: error.details
      })
      
      // Provide user-friendly error messages
      let userMessage = 'Failed to save funnel'
      if (error.message.includes('duplicate')) {
        userMessage = 'A funnel with this name already exists'
      } else if (error.message.includes('constraint')) {
        userMessage = 'Invalid funnel data - please check all fields'
      } else if (error.message.includes('permission')) {
        userMessage = 'Permission denied - please try logging out and back in'
      }
      
      return NextResponse.json({ 
        error: userMessage,
        ...(isDevelopment && { debug: { originalError: error } })
      }, { status: 400 })
    }

    if (!data || data.length === 0) {
      console.error('[FUNNELS API] No data returned from insert')
      return NextResponse.json({ error: 'Failed to create funnel - no data returned' }, { status: 400 })
    }

    if (isDevelopment) {
      console.log('[FUNNELS API] Funnel created successfully:', data[0]?.funnel_id)
    }

    return NextResponse.json({ 
      funnel: data[0],
      funnelId: data[0].funnel_id,
      success: true
    }, { status: 201 })
  } catch (error: any) {
    console.error('Funnel creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
