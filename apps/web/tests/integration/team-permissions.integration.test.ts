import { describe, expect, it } from 'vitest'
import {
  canUseTeamCollaboration,
  hasTeamRoleAtLeast,
  normalizeTeamRole,
} from '@/lib/team/permissions'

describe('team permissions integration', () => {
  it('normalizes unknown role to viewer', () => {
    expect(normalizeTeamRole('unknown')).toBe('viewer')
  })

  it('enforces role hierarchy', () => {
    expect(hasTeamRoleAtLeast('owner', 'admin')).toBe(true)
    expect(hasTeamRoleAtLeast('admin', 'editor')).toBe(true)
    expect(hasTeamRoleAtLeast('viewer', 'editor')).toBe(false)
  })

  it('allows team collaboration for agency users', () => {
    expect(canUseTeamCollaboration({ plan: 'agency', is_admin: false, role: 'viewer' })).toBe(true)
  })

  it('allows team collaboration for admins regardless of plan', () => {
    expect(canUseTeamCollaboration({ plan: 'starter', is_admin: true, role: 'viewer' })).toBe(true)
  })

  it('denies team collaboration for non-agency non-admin users', () => {
    expect(canUseTeamCollaboration({ plan: 'pro', is_admin: false, role: 'viewer' })).toBe(false)
  })
})
