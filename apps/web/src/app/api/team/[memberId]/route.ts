import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClientCompat } from '@/lib/subdomain-auth'
import { getRouteUser } from '@/lib/auth/session'
import { canManageTeamMembers } from '@/lib/team/service'

// PATCH /api/team/[memberId] - Update team member role
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ memberId: string }> }
) {
  try {
    const supabase = await createRouteHandlerClientCompat()
    const { user, response } = await getRouteUser(supabase)
    if (!user) return response!

    const body = await request.json()
    const { role } = body

    if (!role || !['owner', 'admin', 'editor', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const { allowed, scope } = await canManageTeamMembers(supabase, user.id)
    if (!allowed) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Update team member role (must be owner or admin)
    const { memberId } = await context.params
    const { data, error } = await supabase
      .from('team_members')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', memberId)
      .eq('account_owner_id', scope.ownerId)
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
