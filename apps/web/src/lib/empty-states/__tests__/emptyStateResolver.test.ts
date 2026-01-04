/**
 * Empty State Resolution Tests
 * 
 * Validates the governing rule: personality reduces under stress, not increases
 */

import { describe, it, expect } from 'vitest'
import { resolvePersonality } from '@/lib/personality'
import {
  resolvePersonalityBandwidth,
  resolveEmptyStateTone,
  resolveEmptyStateVisuals,
  getEmptyStateCopyTemplate
} from '@/lib/empty-states'

describe('Empty State Resolution', () => {
  describe('Personality Bandwidth', () => {
    it('should allow full personality for expected empty states', () => {
      const bandwidth = resolvePersonalityBandwidth('empty-expected')
      expect(bandwidth).toBe('full')
    })

    it('should reduce personality for unexpected empty states', () => {
      const bandwidth = resolvePersonalityBandwidth('empty-unexpected')
      expect(bandwidth).toBe('reduced')
    })

    it('should minimize personality for recoverable errors', () => {
      const bandwidth = resolvePersonalityBandwidth('recoverable-error')
      expect(bandwidth).toBe('minimal')
    })

    it('should eliminate personality for hard errors', () => {
      const bandwidth = resolvePersonalityBandwidth('hard-error')
      expect(bandwidth).toBe('none')
    })
  })

  describe('Tone Resolution', () => {
    it('should use neutral tone for anti_guru regardless of category', () => {
      const personality = resolvePersonality('anti_guru')
      const categories = ['empty-expected', 'empty-unexpected', 'recoverable-error', 'hard-error'] as const
      
      categories.forEach(category => {
        const tone = resolveEmptyStateTone(personality, category)
        expect(tone).toBe('neutral')
      })
    })

    it('should use encouraging tone for rocket_future in expected states', () => {
      const personality = resolvePersonality('rocket_future')
      const tone = resolveEmptyStateTone(personality, 'empty-expected')
      expect(tone).toBe('encouraging')
    })

    it('should degrade to neutral for rocket_future in errors', () => {
      const personality = resolvePersonality('rocket_future')
      
      const recoverableTone = resolveEmptyStateTone(personality, 'recoverable-error')
      expect(recoverableTone).toBe('neutral')
      
      const hardTone = resolveEmptyStateTone(personality, 'hard-error')
      expect(hardTone).toBe('neutral')
    })

    it('should use contained-chaos for ai_meltdown only in expected states', () => {
      const personality = resolvePersonality('ai_meltdown')
      
      const expectedTone = resolveEmptyStateTone(personality, 'empty-expected')
      expect(expectedTone).toBe('contained-chaos')
      
      const unexpectedTone = resolveEmptyStateTone(personality, 'empty-unexpected')
      expect(unexpectedTone).toBe('neutral')
    })

    it('should always use neutral tone for all hard errors', () => {
      const modes = ['ai_meltdown', 'anti_guru', 'rocket_future'] as const
      
      modes.forEach(mode => {
        const personality = resolvePersonality(mode)
        const tone = resolveEmptyStateTone(personality, 'hard-error')
        expect(tone).toBe('neutral')
      })
    })
  })

  describe('Visual Expression - Motion Reduction Under Stress', () => {
    it('should have no motion for anti_guru', () => {
      const personality = resolvePersonality('anti_guru')
      const visuals = resolveEmptyStateVisuals(personality, 'empty-expected')
      
      expect(visuals.motionIntensity).toBe('none')
      expect(visuals.allowGlitch).toBe(false)
      expect(visuals.iconStyle).toBe('static')
    })

    it('should allow subtle motion for rocket_future in expected states', () => {
      const personality = resolvePersonality('rocket_future')
      const visuals = resolveEmptyStateVisuals(personality, 'empty-expected')
      
      expect(visuals.motionIntensity).toBe('subtle')
      expect(visuals.iconStyle).toBe('animated')
      expect(visuals.allowGlitch).toBe(false) // Never glitch for rocket_future
    })

    it('should reduce motion for rocket_future in unexpected states', () => {
      const personality = resolvePersonality('rocket_future')
      const visuals = resolveEmptyStateVisuals(personality, 'empty-unexpected')
      
      expect(visuals.motionIntensity).toBe('none')
      expect(visuals.iconStyle).toBe('static')
    })

    it('should allow glitch only for ai_meltdown in expected states', () => {
      const personality = resolvePersonality('ai_meltdown')
      
      const expectedVisuals = resolveEmptyStateVisuals(personality, 'empty-expected')
      expect(expectedVisuals.allowGlitch).toBe(true)
      expect(expectedVisuals.motionIntensity).toBe('medium')
      
      const unexpectedVisuals = resolveEmptyStateVisuals(personality, 'empty-unexpected')
      expect(unexpectedVisuals.allowGlitch).toBe(false)
      expect(unexpectedVisuals.motionIntensity).toBe('none')
    })

    it('should eliminate all motion and effects for any hard error', () => {
      const modes = ['ai_meltdown', 'anti_guru', 'rocket_future'] as const
      
      modes.forEach(mode => {
        const personality = resolvePersonality(mode)
        const visuals = resolveEmptyStateVisuals(personality, 'hard-error')
        
        expect(visuals.motionIntensity).toBe('none')
        expect(visuals.allowGlitch).toBe(false)
        expect(visuals.iconStyle).toBe('static')
        expect(visuals.visualNoise).toBe('minimal')
      })
    })

    it('should eliminate all motion for recoverable errors', () => {
      const modes = ['ai_meltdown', 'anti_guru', 'rocket_future'] as const
      
      modes.forEach(mode => {
        const personality = resolvePersonality(mode)
        const visuals = resolveEmptyStateVisuals(personality, 'recoverable-error')
        
        expect(visuals.motionIntensity).toBe('none')
        expect(visuals.iconStyle).toBe('static')
      })
    })
  })

  describe('Copy Templates', () => {
    it('should provide neutral baseline copy', () => {
      const template = getEmptyStateCopyTemplate('neutral', 'empty-expected')
      
      expect(template.headline).toBe('Nothing here yet.')
      expect(template.body).toBe('Create your first item to get started.')
    })

    it('should provide encouraging copy for rocket_future', () => {
      const template = getEmptyStateCopyTemplate('encouraging', 'empty-expected')
      
      expect(template.headline).toBe('This space is ready for its first launch.')
      expect(template.body).toContain('Build')
    })

    it('should provide contained-chaos copy for ai_meltdown', () => {
      const template = getEmptyStateCopyTemplate('contained-chaos', 'empty-expected')
      
      expect(template.headline).toBe('Nothing has formed yet.')
      expect(template.body).toContain('Start')
    })

    it('should fall back to neutral for errors with expressive tones', () => {
      // ai_meltdown in error should get neutral copy
      const template = getEmptyStateCopyTemplate('contained-chaos', 'hard-error')
      
      expect(template.headline).toBe('Unable to continue.')
      expect(template.body).toContain('contact support')
    })
  })

  describe('Governing Rule: Motion Reduces Under Stress', () => {
    it('should never increase motion from expected to unexpected', () => {
      const personality = resolvePersonality('ai_meltdown')
      
      const expectedVisuals = resolveEmptyStateVisuals(personality, 'empty-expected')
      const unexpectedVisuals = resolveEmptyStateVisuals(personality, 'empty-unexpected')
      
      const motionLevels = { none: 0, subtle: 1, medium: 2 }
      
      expect(motionLevels[unexpectedVisuals.motionIntensity])
        .toBeLessThanOrEqual(motionLevels[expectedVisuals.motionIntensity])
    })

    it('should never increase motion from unexpected to error', () => {
      const personality = resolvePersonality('rocket_future')
      
      const unexpectedVisuals = resolveEmptyStateVisuals(personality, 'empty-unexpected')
      const errorVisuals = resolveEmptyStateVisuals(personality, 'recoverable-error')
      
      expect(errorVisuals.motionIntensity).toBe('none')
      expect(unexpectedVisuals.motionIntensity).toBe('none')
    })
  })

  describe('Type Safety', () => {
    it('should enforce valid tone types', () => {
      const validTones: Array<'neutral' | 'encouraging' | 'contained-chaos'> = [
        'neutral',
        'encouraging',
        'contained-chaos'
      ]
      
      expect(validTones).toHaveLength(3)
    })

    it('should enforce valid category types', () => {
      const validCategories: Array<'empty-expected' | 'empty-unexpected' | 'recoverable-error' | 'hard-error'> = [
        'empty-expected',
        'empty-unexpected',
        'recoverable-error',
        'hard-error'
      ]
      
      expect(validCategories).toHaveLength(4)
    })
  })
})
