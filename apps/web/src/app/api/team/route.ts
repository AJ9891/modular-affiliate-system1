import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClientCompat } from '@/lib/subdomain-auth'
import { getRouteUser } from '@/lib/auth/session'
import { canUseTeamCollaboration } from '@/lib/team/permissions'
import { canManageTeamMembers, listTeamMembershipsForOwner, resolveTeamScope } from '@/lib/team/service'

// GET /api/team - List team membership context
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClientCompat()
    const { user, response } = await getRouteUser(supabase)
    if (!user) return response!

    const scope = await resolveTeamScope(supabase, user.id)
    const ownedTeamMembers = await listTeamMembershipsForOwner(supabase, scope.ownerId)

    const { data: memberOf, error: memberError } = await supabase
      .from('team_members')
      .select('*')
      .eq('member_user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 })
    }

    return NextResponse.json({
      ownedTeam: ownedTeamMembers,
      memberOf: memberOf || [],
      isOwner: scope.isOwner,
      userRole: scope.userRole,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/team - Invite team member
export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClientCompat()
    const { user, response } = await getRouteUser(supabase)
    if (!user) return response!

    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('plan, is_admin, role')
      .eq('id', user.id)
      .single()

    if (profileError || !canUseTeamCollaboration(userProfile)) {
      return NextResponse.json(
        { error: 'Team collaboration is only available on the Agency plan' },
        { status: 403 }
      )
    }

    const { allowed, scope } = await canManageTeamMembers(supabase, user.id)
    if (!allowed) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { member_email, role = 'viewer' } = body

    if (!member_email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!['owner', 'admin', 'editor', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const inviteToken = crypto.randomUUID()

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', member_email)
      .maybeSingle()

    const { data: existingInvite } = await supabase
      .from('team_members')
      .select('id, status')
      .eq('account_owner_id', scope.ownerId)
      .eq('member_email', member_email)
      .in('status', ['pending', 'active'])
      .maybeSingle()

    if (existingInvite) {
      return NextResponse.json(
        {
          error:
            existingInvite.status === 'active'
              ? 'This user is already a team member'
              : 'Invitation already sent',
        },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('team_members')
      .insert({
        account_owner_id: scope.ownerId,
        member_user_id: existingUser?.id || null,
        member_email,
        role,
        status: 'pending',
        invite_token: inviteToken,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const inviteLink = `${appUrl}/team/accept?token=${inviteToken}`

      const emailResponse = await fetch(`${appUrl}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: member_email,
          subject: "You've been invited to join a team on Launchpad4Success",
          html: `<p>You've been invited as a <strong>${role}</strong>.</p><p><a href="${inviteLink}">Accept invitation</a></p>`,
        }),
      })

      if (!emailResponse.ok) {
        console.error('Failed to send invite email:', await emailResponse.text())
      }
    } catch (emailError) {
      console.error('Error sending invite email:', emailError)
    }

    return NextResponse.json({
      success: true,
      member: data,
      inviteLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/team/accept?token=${inviteToken}`,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/team?memberId=xxx - Remove team member
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClientCompat()
    const { user, response } = await getRouteUser(supabase)
    if (!user) return response!

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
    }

    const { allowed, scope } = await canManageTeamMembers(supabase, user.id)
    if (!allowed) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId)
      .eq('account_owner_id', scope.ownerId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
