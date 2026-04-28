import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClientCompat } from '@/lib/subdomain-auth'
import { getRouteUser } from '@/lib/auth/session'
import { teamInviteSchema } from '@/lib/security'
import { canUseTeamCollaboration } from '@/lib/team/permissions'
import { canManageTeamMembers, listTeamMembershipsForOwner, resolveTeamScope } from '@/lib/team/service'

// GET /api/team/members - List team members
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClientCompat()
    const { user, response } = await getRouteUser(supabase)
    if (!user) return response!

    const scope = await resolveTeamScope(supabase, user.id)
    const members = await listTeamMembershipsForOwner(supabase, scope.ownerId)

    return NextResponse.json({
      success: true,
      members,
      userRole: scope.userRole,
      ownerId: scope.ownerId,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/team/members - Invite team member
export async function POST(req: NextRequest) {
  try {
    const supabase = await createRouteHandlerClientCompat()
    const { user, response } = await getRouteUser(supabase)
    if (!user) return response!

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('plan, is_admin, role')
      .eq('id', user.id)
      .single()

    if (profileError || !canUseTeamCollaboration(profile)) {
      return NextResponse.json(
        { error: 'Team collaboration is only available on the Agency plan' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validation = teamInviteSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.issues.map((err) => `${err.path.join('.')}: ${err.message}`)
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 })
    }

    const { allowed, scope } = await canManageTeamMembers(supabase, user.id)
    if (!allowed) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { email, role } = validation.data
    const inviteToken = crypto.randomUUID()

    const { data: existingInvite } = await supabase
      .from('team_members')
      .select('id, status')
      .eq('account_owner_id', scope.ownerId)
      .eq('member_email', email)
      .in('status', ['pending', 'active'])
      .maybeSingle()

    if (existingInvite) {
      return NextResponse.json(
        {
          error:
            existingInvite.status === 'active'
              ? 'User is already a team member'
              : 'Invitation already sent',
        },
        { status: 400 }
      )
    }

    const { data: invitation, error } = await supabase
      .from('team_members')
      .insert({
        account_owner_id: scope.ownerId,
        member_email: email,
        role,
        status: 'pending',
        invite_token: inviteToken,
        invited_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create invitation: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      invitation,
      inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/team/accept?token=${inviteToken}`,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/team/members?memberId=xxx - Remove team member
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createRouteHandlerClientCompat()
    const { user, response } = await getRouteUser(supabase)
    if (!user) return response!

    const memberId = new URL(req.url).searchParams.get('memberId')
    if (!memberId) {
      return NextResponse.json({ error: 'memberId is required' }, { status: 400 })
    }

    const { allowed, scope } = await canManageTeamMembers(supabase, user.id)
    if (!allowed) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { data: removedMember, error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId)
      .eq('account_owner_id', scope.ownerId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to remove team member: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      member: removedMember,
      message: 'Team member removed successfully',
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
