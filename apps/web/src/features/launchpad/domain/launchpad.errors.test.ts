import { describe, expect, it } from 'vitest'
import { toLaunchpadError } from './launchpad.errors'

describe('toLaunchpadError', () => {
  it('translates capacity failures without leaking database details', () => {
    expect(toLaunchpadError({ message: 'Launchpad capacity reached', status: 402 })).toEqual({
      code: 'CAPACITY_REACHED',
      message: 'Your current plan has reached its active Launchpad limit.',
      retryable: false,
    })
  })

  it('translates optimistic concurrency conflicts', () => {
    expect(toLaunchpadError({ message: 'changed in another session' }).code)
      .toBe('CONFLICT_DETECTED')
  })

  it('uses a calm fallback without exposing raw provider errors', () => {
    const translated = toLaunchpadError(new Error('duplicate key value violates constraint'))
    expect(translated.code).toBe('UNKNOWN')
    expect(translated.message).not.toContain('duplicate key')
  })
})
