import { describe, expect, it } from 'vitest'
import { ValidationError } from '@/lib/http'
import { validateFunnel } from '@/lib/validators/funnels'

describe('validateFunnel', () => {
  it('defaults missing blocks to an empty array', () => {
    const payload = validateFunnel({
      name: 'My Funnel',
      template: 'lead_magnet',
      niche: 'general',
    })

    expect(payload.blocks).toEqual([])
  })

  it('rejects non-array blocks', () => {
    expect(() =>
      validateFunnel({
        name: 'My Funnel',
        blocks: { type: 'hero' },
      })
    ).toThrow(ValidationError)
  })
})
