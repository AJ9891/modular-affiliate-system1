import { describe, expect, it } from 'vitest'
import { isMissingAuthSessionError } from '@/lib/auth/errors'

describe('isMissingAuthSessionError', () => {
  it('recognizes Supabase AuthSessionMissingError by name', () => {
    expect(
      isMissingAuthSessionError({
        name: 'AuthSessionMissingError',
        message: 'Auth session missing!',
      })
    ).toBe(true)
  })

  it('recognizes missing-session errors by message', () => {
    expect(isMissingAuthSessionError({ message: 'Auth session missing!' })).toBe(true)
  })

  it('does not suppress unrelated auth failures', () => {
    expect(isMissingAuthSessionError({ name: 'AuthApiError', message: 'Invalid JWT' })).toBe(false)
  })
})
