import { describe, expect, it } from 'vitest'
import { LAUNCHPAD_INTENT_OPTIONS, getIntentPreset } from '@/lib/launchpad/preflight'

describe('launchpad preflight intent presets', () => {
  it('exposes all supported intent options', () => {
    expect(LAUNCHPAD_INTENT_OPTIONS.map((item) => item.id)).toEqual([
      'first-funnel',
      'import-traffic',
      'setup-email',
    ])
  })

  it('maps first-funnel intent to onboarding step 1 with lead-gen preset', () => {
    const preset = getIntentPreset('first-funnel')
    expect(preset.nextStep).toBe(1)
    expect(preset.suggestedTemplate).toBe('lead-gen')
  })

  it('maps import-traffic intent to tracking-safe review template', () => {
    const preset = getIntentPreset('import-traffic')
    expect(preset.nextStep).toBe(1)
    expect(preset.suggestedTemplate).toBe('review')
    expect(preset.suggestedNiche).toBe('technology')
  })

  it('maps setup-email intent to education niche starter', () => {
    const preset = getIntentPreset('setup-email')
    expect(preset.nextStep).toBe(1)
    expect(preset.suggestedTemplate).toBe('lead-gen')
    expect(preset.suggestedNiche).toBe('education')
  })
})

