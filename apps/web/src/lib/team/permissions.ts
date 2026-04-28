import { hasAdminAccess } from '@/lib/admin-access'

export type TeamRole = 'owner' | 'admin' | 'editor' | 'viewer'

const ROLE_HIERARCHY: Record<TeamRole, number> = {
  owner: 3,
  admin: 2,
  editor: 1,
  viewer: 0,
}

export function normalizeTeamRole(role: string | null | undefined): TeamRole {
  const normalized = role?.toLowerCase().trim()
  if (normalized === 'owner') return 'owner'
  if (normalized === 'admin') return 'admin'
  if (normalized === 'editor') return 'editor'
  return 'viewer'
}

export function hasTeamRoleAtLeast(role: string | null | undefined, minimum: TeamRole): boolean {
  return ROLE_HIERARCHY[normalizeTeamRole(role)] >= ROLE_HIERARCHY[minimum]
}

type TeamEligibilityProfile = {
  plan?: string | null
  is_admin?: boolean | null
  role?: string | null
}

export function canUseTeamCollaboration(profile: TeamEligibilityProfile | null | undefined): boolean {
  if (!profile) return false
  if (hasAdminAccess(profile)) return true
  return (profile.plan || '').toLowerCase() === 'agency'
}
