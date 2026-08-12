import { describe, expect, it } from 'vitest'
import { resolveVisionIntent } from '../vision.intent'

describe('resolveVisionIntent', () => {
  it('uses stable action IDs instead of display titles', () => {
    expect(resolveVisionIntent('Why are my conversions flat?')).toMatchObject({ intent: 'optimize', actionId: 'optimize-funnel' })
  })

  it('lets platform state decide next-best-action prompts', () => {
    const result = resolveVisionIntent('What should I do next?')
    expect(result.intent).toBe('next-best-action')
    expect(result.actionId).toBeUndefined()
  })
})
