import type { SupabaseClient } from '@supabase/supabase-js'
import { hasTeamRoleAtLeast, normalizeTeamRole, type TeamRole } from '@/lib/team/permissions'

export type TeamScope = {
  ownerId: string
  userRole: TeamRole
  isOwner: boolean
}

export async function resolveTeamScope(supabase: SupabaseClient, userId: string): Promise<TeamScope> {
  const { data: membership } = await supabase
    .from('team_members')
    .select('account_owner_id, role')
    .eq('member_user_id', userId)
    .eq('status', 'active')
    .maybeSingle()

  if (membership?.account_owner_id) {
    return {
      ownerId: membership.account_owner_id,
      userRole: normalizeTeamRole(membership.role),
      isOwner: membership.account_owner_id === userId,
    }
  }

  return {
    ownerId: userId,
    userRole: 'owner',
    isOwner: true,
  }
}

export async function canManageTeamMembers(
  supabase: SupabaseClient,
  userId: string
): Promise<{ allowed: boolean; scope: TeamScope }> {
  const scope = await resolveTeamScope(supabase, userId)
  const allowed = scope.isOwner || hasTeamRoleAtLeast(scope.userRole, 'admin')
  return { allowed, scope }
}

export async function listTeamMembershipsForOwner(supabase: SupabaseClient, ownerId: string) {
  const { data, error } = await supabase
    .from('team_members')
    .select(`
      *,
      member_user:member_user_id(id, email, subdomain, plan),
      account_owner:account_owner_id(id, email, subdomain)
    `)
    .eq('account_owner_id', ownerId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch team members: ${error.message}`)
  }

  return data || []
}
