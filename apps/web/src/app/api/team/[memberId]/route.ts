import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// PATCH /api/team/[memberId] - Update team member role
export async function PATCH(
  request: NextRequest,
  { params }: { params: { memberId: string } }
) {
  try {
    const accessToken = request.cookies.get('sb-access-token')?.value
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { role } = body

    if (!role || !['owner', 'admin', 'editor', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Update team member role (must be owner or admin)
    const { data, error } = await supabase
      .from('team_members')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', params.memberId)
      .eq('account_owner_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Member not found or unauthorized' }, { status: 404 })
    }

    return NextResponse.json({ success: true, member: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
