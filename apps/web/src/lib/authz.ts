import type { SupabaseClient } from '@supabase/supabase-js'
import { hasAdminAccess } from '@/lib/admin-access'

export class AuthError extends Error {
  status: number
  constructor(message = 'Not authenticated', status = 401) {
    super(message)
    this.status = status
  }
}

export async function requireUser<T>(
  supabase: SupabaseClient<T>,
  accessToken?: string
) {
  const { data, error } = accessToken
    ? await supabase.auth.getUser(accessToken)
    : await supabase.auth.getUser()

  if (error || !data?.user) {
    throw new AuthError('Authentication required')
  }

  return data.user
}

export type UserProfile = {
  id: string
  email?: string
  is_admin?: boolean
  role?: string | null
  subscription_plan?: string
  subdomain?: string | null
  custom_domain?: string | null
}

export async function fetchUserProfile(
  adminClient: SupabaseClient,
  userId: string,
  columns = 'id,email,is_admin,subscription_plan,subdomain,custom_domain'
): Promise<UserProfile | null> {
  const { data, error } = await adminClient
    .from('users')
    .select(columns)
    .eq('id', userId)
    .single()

  if (error) {
    throw new Error(`Failed to load profile: ${error.message}`)
  }

  return data as unknown as UserProfile
}

export function canUseCustomDomain(profile?: UserProfile | null) {
  if (!profile) return false
  return hasAdminAccess(profile) || profile.subscription_plan === 'agency'
}
