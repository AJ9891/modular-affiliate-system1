import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { withRateLimit, withAuth, withValidation, withErrorHandling } from '@/lib/api-middleware'
import { teamInviteSchema } from '@/lib/security'

// GET /api/team/members - List team members
export const GET = withRateLimit(
  withErrorHandling(
    withAuth(async (req: NextRequest, userId: string) => {
      const supabase = createRouteHandlerClient({ cookies })
      
      // Check if user is account owner or admin
      const { data: teamData, error } = await supabase
        .from('team_members')
        .select(`
          *,
          member_user:member_user_id(id, email, subdomain, plan),
          account_owner:account_owner_id(id, email, subdomain)
        `)
        .or(`account_owner_id.eq.${userId},member_user_id.eq.${userId}`)
        .eq('status', 'active')

      if (error) {
        throw new Error('Failed to fetch team members')
      }

      // Get user's role in the team
      const userRole = teamData?.find(member => 
        member.account_owner_id === userId || member.member_user_id === userId
      )?.role || 'viewer'

      // Filter data based on permissions
      if (!['owner', 'admin'].includes(userRole)) {
        // Non-admin users can only see basic team info
        const filteredData = teamData?.map(member => ({
          id: member.id,
          role: member.role,
          status: member.status,
          member_user: member.member_user ? {
            email: member.member_user.email,
            subdomain: member.member_user.subdomain
          } : null
        }))
        
        return NextResponse.json({ 
          success: true, 
          members: filteredData,
          userRole 
        })
      }

      return NextResponse.json({ 
        success: true, 
        members: teamData,
        userRole 
      })
    })
  ),
  'api'
)

// POST /api/team/members - Invite team member
export const POST = withRateLimit(
  withErrorHandling(
    withAuth(async (req: NextRequest, userId: string) => {
      const body = await req.json()
      const validation = teamInviteSchema.safeParse(body)

      if (!validation.success) {
        const errors = validation.error.issues.map(err => `${err.path.join('.')}: ${err.message}`)
        return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 })
      }

      const { email, role } = validation.data
      const supabase = createRouteHandlerClient({ cookies })

      // Check if user is account owner or admin
      const { data: userTeamData } = await supabase
        .from('team_members')
        .select('role')
        .eq('account_owner_id', userId)
        .single()

      if (!userTeamData && !await isAccountOwner(userId, supabase)) {
        return NextResponse.json(
          { error: 'Only account owners and admins can invite team members' },
          { status: 403 }
        )
      }

      // Check if user already invited
      const { data: existingInvite } = await supabase
        .from('team_members')
        .select('id, status')
        .eq('account_owner_id', userId)
        .eq('member_email', email)
        .single()

      if (existingInvite) {
        return NextResponse.json(
          { 
            error: existingInvite.status === 'active' 
              ? 'User is already a team member' 
              : 'Invitation already sent' 
          },
          { status: 400 }
        )
      }

      // Generate unique invite token
      const inviteToken = crypto.randomUUID()

      // Create invitation
      const { data: invitation, error } = await supabase
        .from('team_members')
        .insert({
          account_owner_id: userId,
          member_email: email,
          role,
          status: 'pending',
          invite_token: inviteToken,
          invited_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        throw new Error('Failed to create invitation')
      }

      // Log team activity
      await logTeamActivity(supabase, userId, 'invite_sent', 'team_member', invitation.id, {
        email,
        role,
        inviteToken
      })

      // TODO: Send invitation email
      console.log(`Team invitation sent to ${email} with role ${role}`)

      return NextResponse.json({
        success: true,
        invitation,
        inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/team/accept/${inviteToken}`
      })
    })
  ),
  'api'
)

// DELETE /api/team/members/[memberId] - Remove team member
export async function DELETE(
  req: NextRequest
) {
  const url = new URL(req.url)
  const memberId = url.searchParams.get('memberId')

  if (!memberId) {
    return NextResponse.json(
      { error: 'memberId is required' },
      { status: 400 }
    )
  }

  return withRateLimit(
    withErrorHandling(
      withAuth(async (req: NextRequest, userId: string) => {
        const supabase = createRouteHandlerClient({ cookies })

        // Check permissions
        if (!await hasTeamPermission(userId, 'admin', supabase)) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          )
        }

        // Remove team member
        const { data: removedMember, error } = await supabase
          .from('team_members')
          .delete()
          .eq('id', memberId)
          .eq('account_owner_id', userId)
          .select()
          .single()

        if (error) {
          throw new Error('Failed to remove team member')
        }

        // Log activity
        await logTeamActivity(supabase, userId, 'member_removed', 'team_member', memberId, {
          memberEmail: removedMember.member_email,
          role: removedMember.role
        })

        return NextResponse.json({
          success: true,
          message: 'Team member removed successfully'
        })
      })
    )
  )(req)
}

// Helper functions
async function isAccountOwner(userId: string, supabase: any): Promise<boolean> {
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single()
  
  return !!data
}

async function hasTeamPermission(userId: string, minRole: string, supabase: any): Promise<boolean> {
  const roleHierarchy = { owner: 3, admin: 2, editor: 1, viewer: 0 }
  
  const { data } = await supabase
    .from('team_members')
    .select('role')
    .or(`account_owner_id.eq.${userId},member_user_id.eq.${userId}`)
    .eq('status', 'active')
    .single()

  if (!data) return false
  
  const userRoleLevel = roleHierarchy[data.role as keyof typeof roleHierarchy] || 0
  const minRoleLevel = roleHierarchy[minRole as keyof typeof roleHierarchy] || 0
  
  return userRoleLevel >= minRoleLevel
}

async function logTeamActivity(
  supabase: any, 
  userId: string, 
  action: string, 
  resourceType: string, 
  resourceId: string, 
  details: any
) {
  await supabase
    .from('team_activity_log')
    .insert({
      team_id: userId, // Using account owner as team_id
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details
    })
}
