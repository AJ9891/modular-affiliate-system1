import type { SupabaseClient } from '@supabase/supabase-js'
import { canUseTeamCollaboration } from '@/lib/team/permissions'
import { canManageTeamMembers, listTeamMembershipsForOwner, resolveTeamScope } from '@/lib/team/service'

export async function getTeamContext(supabase: SupabaseClient, userId: string) {
  const scope = await resolveTeamScope(supabase, userId)
  const ownedTeamMembers = await listTeamMembershipsForOwner(supabase, scope.ownerId)

  const { data: memberOf, error: memberError } = await supabase
    .from('team_members')
    .select('*')
    .eq('member_user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (memberError) {
    throw new Error(memberError.message)
  }

  return {
    ownedTeam: ownedTeamMembers,
    memberOf: memberOf || [],
    isOwner: scope.isOwner,
    userRole: scope.userRole,
  }
}

export async function inviteTeamMember(
  supabase: SupabaseClient,
  userId: string,
  input: { memberEmail: string; role: 'owner' | 'admin' | 'editor' | 'viewer' }
) {
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('plan, is_admin, role')
    .eq('id', userId)
    .single()

  if (profileError || !canUseTeamCollaboration(userProfile)) {
    const err = new Error('Team collaboration is only available on the Agency plan')
    ;(err as Error & { status?: number }).status = 403
    throw err
  }

  const { allowed, scope } = await canManageTeamMembers(supabase, userId)
  if (!allowed) {
    const err = new Error('Insufficient permissions')
    ;(err as Error & { status?: number }).status = 403
    throw err
  }

  const inviteToken = crypto.randomUUID()

  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', input.memberEmail)
    .maybeSingle()

  const { data: existingInvite } = await supabase
    .from('team_members')
    .select('id, status')
    .eq('account_owner_id', scope.ownerId)
    .eq('member_email', input.memberEmail)
    .in('status', ['pending', 'active'])
    .maybeSingle()

  if (existingInvite) {
    const err = new Error(
      existingInvite.status === 'active'
        ? 'This user is already a team member'
        : 'Invitation already sent'
    )
    ;(err as Error & { status?: number }).status = 400
    throw err
  }

  const { data, error } = await supabase
    .from('team_members')
    .insert({
      account_owner_id: scope.ownerId,
      member_user_id: existingUser?.id || null,
      member_email: input.memberEmail,
      role: input.role,
      status: 'pending',
      invite_token: inviteToken,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return { member: data, inviteToken }
}

export async function removeTeamMember(supabase: SupabaseClient, userId: string, memberId: string) {
  const { allowed, scope } = await canManageTeamMembers(supabase, userId)
  if (!allowed) {
    const err = new Error('Insufficient permissions')
    ;(err as Error & { status?: number }).status = 403
    throw err
  }

  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', memberId)
    .eq('account_owner_id', scope.ownerId)

  if (error) {
    throw new Error(error.message)
  }
}
