import { describe, expect, it } from 'vitest'
import {
  GUIDED_BUILDER_MODULES,
  getGuidedBuilderHelpMessage,
  getNextGuidedBuilderModuleIndex,
} from '@/lib/launchpad/guidedBuilder'

describe('guided builder helpers', () => {
  it('keeps module registry in expected launch order', () => {
    expect(GUIDED_BUILDER_MODULES.map((module) => module.id)).toEqual(['hero', 'offer', 'cta', 'proof'])
  })

  it('cycles highlight index safely', () => {
    expect(getNextGuidedBuilderModuleIndex(0, 4)).toBe(1)
    expect(getNextGuidedBuilderModuleIndex(3, 4)).toBe(0)
    expect(getNextGuidedBuilderModuleIndex(2, 0)).toBe(0)
  })

  it('returns contextual help text for each module', () => {
    expect(getGuidedBuilderHelpMessage('hero')).toContain('one-sentence promise')
    expect(getGuidedBuilderHelpMessage('offer')).toContain('outcome')
    expect(getGuidedBuilderHelpMessage('cta')).toContain('button text')
    expect(getGuidedBuilderHelpMessage('proof')).toContain('proof artifact')
  })
})

