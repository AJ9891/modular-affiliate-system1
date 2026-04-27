export type AdminAccessProfile = {
  is_admin?: boolean | null
  role?: string | null
}

export function hasAdminAccess(profile?: AdminAccessProfile | null): boolean {
  if (!profile) return false
  if (profile.is_admin === true) return true

  const role = profile.role?.toLowerCase().trim()
  return role === 'admin' || role === 'owner'
}
