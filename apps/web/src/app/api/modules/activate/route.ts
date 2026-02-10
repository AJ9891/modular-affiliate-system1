import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { checkSupabase } from '@/lib/check-supabase'

export async function POST(request: NextRequest) {
  const check = checkSupabase()
  if (check) return check
  
  try {
    const supabase = createRouteHandlerClient({ cookies })
    // Get user from session
    const accessToken = request.cookies.get('sb-access-token')?.value
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase!.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const { moduleId, moduleName } = await request.json()

    if (!moduleId || !moduleName) {
      return NextResponse.json(
        { error: 'Module ID and name are required' },
        { status: 400 }
      )
    }

    // Store the activated module in the database
    const { data, error } = await supabase!
      .from('user_modules')
      .upsert({
        user_id: user.id,
        module_id: moduleId,
        module_name: moduleName,
        activated_at: new Date().toISOString(),
        is_active: true
      }, {
        onConflict: 'user_id,module_id'
      })
      .select()

    if (error) {
      console.error('Error activating module:', error)
      // If table doesn't exist, just return success (we'll track it client-side)
      return NextResponse.json({
        success: true,
        module: { id: moduleId, name: moduleName }
      })
    }

    return NextResponse.json({
      success: true,
      module: data?.[0] || { id: moduleId, name: moduleName }
    })
  } catch (error: any) {
    console.error('Module activation error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
