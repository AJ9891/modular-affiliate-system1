/**
 * Hero Copy Resolution Tests
 * 
 * Demonstrates how personality → behavior → contract → prompt works
 */

import { describe, it, expect } from 'vitest'
import { resolvePersonality } from '@/lib/personality'
import { resolveHeroBehavior } from '@/lib/personality/heroBehavior'
import { resolveHeroCopyContract } from '@/lib/hero'
import { resolveAIPrompt, buildHeroPrompt } from '@/lib/ai-generator'

describe('Hero Copy Resolution Chain', () => {
  describe('Contract Resolution', () => {
    it('should forbid promises universally', () => {
      const modes = ['ai_meltdown', 'anti_guru', 'rocket_future'] as const
      
      modes.forEach(mode => {
        const personality = resolvePersonality(mode)
        const behavior = resolveHeroBehavior(personality)
        const contract = resolveHeroCopyContract(behavior)
        
        expect(contract.forbidPromises).toBe(true)
      })
    })

    it('should enable sarcasm only when glitch is allowed', () => {
      // AI Meltdown has glitch enabled
      const aiMeltdown = resolvePersonality('ai_meltdown')
      const meltdownBehavior = resolveHeroBehavior(aiMeltdown)
      const meltdownContract = resolveHeroCopyContract(meltdownBehavior)
      expect(meltdownContract.allowSarcasm).toBe(true)

      // Anti-Guru has no glitch
      const antiGuru = resolvePersonality('anti_guru')
      const guruBehavior = resolveHeroBehavior(antiGuru)
      const guruContract = resolveHeroCopyContract(guruBehavior)
      expect(guruContract.allowSarcasm).toBe(false)
    })

    it('should use short headlines for fractured style', () => {
      const aiMeltdown = resolvePersonality('ai_meltdown')
      const behavior = resolveHeroBehavior(aiMeltdown)
      const contract = resolveHeroCopyContract(behavior)
      
      expect(behavior.headlineStyle).toBe('fractured')
      expect(contract.headlineLength).toBe('short')
    })

    it('should use explained subcopy for mentor posture', () => {
      const rocketFuture = resolvePersonality('rocket_future')
      const behavior = resolveHeroBehavior(rocketFuture)
      const contract = resolveHeroCopyContract(behavior)
      
      expect(behavior.subcopyStyle).toBe('explanatory')
      expect(contract.subcopyDensity).toBe('explained')
    })
  })

  describe('Prompt Building', () => {
    it('should build valid prompt with all constraints', () => {
      const personality = resolvePersonality('anti_guru')
      const behavior = resolveHeroBehavior(personality)
      const contract = resolveHeroCopyContract(behavior)
      const aiProfile = resolveAIPrompt(personality)
      
      const prompt = buildHeroPrompt(aiProfile, contract)
      
      // Should include system message
      expect(prompt).toContain(aiProfile.system)
      
      // Should include constraints
      expect(prompt).toContain('Headline length:')
      expect(prompt).toContain('Subcopy density:')
      expect(prompt).toContain('Sarcasm allowed:')
      expect(prompt).toContain('Promises forbidden:')
      
      // Should include principles
      aiProfile.principles.forEach(principle => {
        expect(prompt).toContain(principle)
      })
      
      // Should include forbidden patterns
      aiProfile.forbidden.forEach(forbidden => {
        expect(prompt).toContain(forbidden)
      })
    })

    it('should create different prompts for different brand modes', () => {
      const modes = ['ai_meltdown', 'anti_guru', 'rocket_future'] as const
      const prompts = modes.map(mode => {
        const personality = resolvePersonality(mode)
        const behavior = resolveHeroBehavior(personality)
        const contract = resolveHeroCopyContract(behavior)
        const aiProfile = resolveAIPrompt(personality)
        return buildHeroPrompt(aiProfile, contract)
      })
      
      // All prompts should be unique
      expect(new Set(prompts).size).toBe(3)
      
      // But all should forbid promises
      prompts.forEach(prompt => {
        expect(prompt).toContain('Promises forbidden: true')
      })
    })
  })

  describe('Full Chain Integration', () => {
    it('should resolve complete chain for AI Meltdown', () => {
      const personality = resolvePersonality('ai_meltdown')
      const behavior = resolveHeroBehavior(personality)
      const contract = resolveHeroCopyContract(behavior)
      const aiProfile = resolveAIPrompt(personality)
      const prompt = buildHeroPrompt(aiProfile, contract)
      
      // Verify chain coherence
      expect(personality.authorityTone).toBe('unraveling')
      expect(behavior.headlineStyle).toBe('fractured')
      expect(contract.headlineLength).toBe('short')
      expect(contract.allowSarcasm).toBe(true)
      expect(prompt).toContain('Headline length: short')
      expect(prompt).toContain('Sarcasm allowed: true')
    })

    it('should resolve complete chain for Anti-Guru', () => {
      const personality = resolvePersonality('anti_guru')
      const behavior = resolveHeroBehavior(personality)
      const contract = resolveHeroCopyContract(behavior)
      const aiProfile = resolveAIPrompt(personality)
      const prompt = buildHeroPrompt(aiProfile, contract)
      
      // Verify chain coherence
      expect(personality.authorityTone).toBe('blunt')
      expect(behavior.headlineStyle).toBe('flat')
      expect(contract.headlineLength).toBe('medium')
      expect(contract.allowSarcasm).toBe(false)
      expect(prompt).toContain('Headline length: medium')
      expect(prompt).toContain('Sarcasm allowed: false')
    })

    it('should resolve complete chain for Rocket Future', () => {
      const personality = resolvePersonality('rocket_future')
      const behavior = resolveHeroBehavior(personality)
      const contract = resolveHeroCopyContract(behavior)
      const aiProfile = resolveAIPrompt(personality)
      const prompt = buildHeroPrompt(aiProfile, contract)
      
      // Verify chain coherence
      expect(personality.authorityTone).toBe('calm')
      expect(behavior.subcopyStyle).toBe('explanatory')
      expect(contract.subcopyDensity).toBe('explained')
      expect(prompt).toContain('Subcopy density: explained')
    })
  })

  describe('Contract Invariants', () => {
    it('should maintain type safety throughout chain', () => {
      const personality = resolvePersonality('ai_meltdown')
      const behavior = resolveHeroBehavior(personality)
      const contract = resolveHeroCopyContract(behavior)
      
      // TypeScript should enforce these types
      const validHeadlineLength: 'short' | 'medium' = contract.headlineLength
      const validSubcopyDensity: 'minimal' | 'explained' = contract.subcopyDensity
      const validBoolean: boolean = contract.allowSarcasm
      
      expect(validHeadlineLength).toBeDefined()
      expect(validSubcopyDensity).toBeDefined()
      expect(validBoolean).toBeDefined()
    })

    it('should never allow promises to be true', () => {
      // This is a core invariant - promises are ALWAYS forbidden
      const modes = ['ai_meltdown', 'anti_guru', 'rocket_future'] as const
      
      modes.forEach(mode => {
        const personality = resolvePersonality(mode)
        const behavior = resolveHeroBehavior(personality)
        const contract = resolveHeroCopyContract(behavior)
        
        // Hard-coded to true in resolver - this should never be false
        expect(contract.forbidPromises).toBe(true)
      })
    })
  })
})
