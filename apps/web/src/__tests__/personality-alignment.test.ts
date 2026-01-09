/**
 * Personality Alignment Test Suite
 * 
 * Tests that verify our personality trait fixes are working correctly.
 * Run this to ensure AI Meltdown is sarcastic and Anti-Guru is brutally honest.
 */

import { describe, it, expect, test } from 'vitest';
import { CANONICAL_PERSONALITIES } from '../lib/personality/canonical-definitions';
import { validateAllPersonalityProfiles, checkPersonalityAlignment } from '../lib/brand-brain/validation';
import { buildCanonicalAIProfile, validateAIPromptAlignment } from '../lib/personality/canonical-ai-resolver';
import { resolvePersonality } from '../lib/personality/resolvePersonality';
import { BRAND_MODES } from '../contexts/BrandModeContext';

describe('Personality Trait Alignment', () => {
  
  test('Canonical personalities have correct primary traits', () => {
    expect(CANONICAL_PERSONALITIES.glitch.primaryTrait).toBe('sarcastic');
    expect(CANONICAL_PERSONALITIES.anchor.primaryTrait).toBe('brutally_honest');
    expect(CANONICAL_PERSONALITIES.boost.primaryTrait).toBe('encouraging');
  });

  test('AI Meltdown is sarcastic (not brutally honest)', () => {
    const glitch = CANONICAL_PERSONALITIES.glitch;
    
    expect(glitch.name).toBe('AI Meltdown');
    expect(glitch.primaryTrait).toBe('sarcastic');
    expect(glitch.voice.tone).toBe('sarcastic');
    expect(glitch.secondaryTraits).toContain('witty');
    expect(glitch.secondaryTraits).not.toContain('brutally_honest');
  });

  test('Anti-Guru is brutally honest (not sarcastic)', () => {
    const anchor = CANONICAL_PERSONALITIES.anchor;
    
    expect(anchor.name).toBe('Anti-Guru');
    expect(anchor.primaryTrait).toBe('brutally_honest');
    expect(anchor.voice.tone).toBe('brutally_honest');
    expect(anchor.secondaryTraits).toContain('direct');
    expect(anchor.secondaryTraits).not.toContain('sarcastic');
  });

  test('Rocket Future is encouraging (confirmed)', () => {
    const boost = CANONICAL_PERSONALITIES.boost;
    
    expect(boost.name).toBe('Rocket Future');
    expect(boost.primaryTrait).toBe('encouraging');
    expect(boost.voice.tone).toBe('encouraging');
    expect(boost.secondaryTraits).toContain('optimistic');
  });

});

describe('Brand Brain Profile Alignment', () => {

  test('Brand Brain validation passes for all personalities', () => {
    const validation = validateAllPersonalityProfiles();
    
    if (!validation.isValid) {
      console.error('Brand Brain Validation Errors:', validation.errors);
    }
    
    expect(validation.isValid).toBe(true);
  });

  test('Quick personality alignment check passes', () => {
    const alignment = checkPersonalityAlignment();
    
    expect(alignment.glitchIsSarcastic).toBe(true);
    expect(alignment.anchorIsBrutallyHonest).toBe(true);
    expect(alignment.boostIsEncouraging).toBe(true);
    expect(alignment.allAligned).toBe(true);
  });

});

describe('Personality Resolution System', () => {

  test('AI Meltdown personality resolver is sarcastic', () => {
    const personality = resolvePersonality('ai_meltdown');
    
    expect(personality.name).toBe('AI Meltdown');
    expect(personality.authorityTone).toBe('sarcastic');
    expect(personality.vocabulary?.preferredPhrases).toContain('*eye roll*');
    expect(personality.vocabulary?.forbiddenPhrases).toContain('brutal truth');
  });

  test('Anti-Guru personality resolver is brutally honest', () => {
    const personality = resolvePersonality('anti_guru');
    
    expect(personality.name).toBe('Anti-Guru');
    expect(personality.authorityTone).toBe('brutally_honest');
    expect(personality.vocabulary?.preferredPhrases).toContain('Here\'s the brutal truth');
    expect(personality.vocabulary?.forbiddenPhrases).toContain('allegedly');
  });

  test('Rocket Future personality resolver is encouraging', () => {
    const personality = resolvePersonality('rocket_future');
    
    expect(personality.name).toBe('Rocket Future');
    expect(personality.authorityTone).toBe('encouraging');
    expect(personality.vocabulary?.preferredPhrases).toContain('You\'ve got this!');
    expect(personality.vocabulary?.forbiddenPhrases).toContain('brutal truth');
  });

});

describe('UI Context Alignment', () => {

  test('BrandModeContext has correct voice descriptions', () => {
    expect(BRAND_MODES.meltdown.voice).toContain('sarcastic');
    expect(BRAND_MODES.antiguru.voice).toContain('brutally honest');
    expect(BRAND_MODES.rocket.voice).toContain('encouraging');
  });

  test('BrandModeContext AI prompts mention correct traits', () => {
    expect(BRAND_MODES.meltdown.aiPrompt.toLowerCase()).toContain('sarcastic');
    expect(BRAND_MODES.antiguru.aiPrompt.toLowerCase()).toContain('brutally honest');
    expect(BRAND_MODES.rocket.aiPrompt.toLowerCase()).toContain('encouraging');
  });

});

describe('AI Generation Alignment', () => {

  test('AI profiles have correct primary traits', () => {
    const glitchAI = buildCanonicalAIProfile('glitch');
    const anchorAI = buildCanonicalAIProfile('anchor');
    const boostAI = buildCanonicalAIProfile('boost');
    
    expect(glitchAI.primaryTrait).toBe('sarcastic');
    expect(anchorAI.primaryTrait).toBe('brutally_honest');
    expect(boostAI.primaryTrait).toBe('encouraging');
  });

  test('AI profiles avoid cross-contamination', () => {
    const glitchAI = buildCanonicalAIProfile('glitch');
    const anchorAI = buildCanonicalAIProfile('anchor');
    const boostAI = buildCanonicalAIProfile('boost');
    
    // AI Meltdown should avoid brutal honesty
    expect(glitchAI.mustAvoid.join(' ').toLowerCase()).toContain('brutal');
    
    // Anti-Guru should avoid sarcasm
    expect(anchorAI.mustAvoid.join(' ').toLowerCase()).toContain('sarcastic');
    
    // Rocket should avoid both
    expect(boostAI.mustAvoid.join(' ').toLowerCase()).toContain('sarcastic');
    expect(boostAI.mustAvoid.join(' ').toLowerCase()).toContain('brutal');
  });

  test('AI prompt validation passes for all personalities', () => {
    const glitchValidation = validateAIPromptAlignment('glitch');
    const anchorValidation = validateAIPromptAlignment('anchor');
    const boostValidation = validateAIPromptAlignment('boost');
    
    if (!glitchValidation.isValid) {
      console.error('Glitch AI Issues:', glitchValidation.issues);
    }
    if (!anchorValidation.isValid) {
      console.error('Anchor AI Issues:', anchorValidation.issues);
    }
    if (!boostValidation.isValid) {
      console.error('Boost AI Issues:', boostValidation.issues);
    }
    
    expect(glitchValidation.isValid).toBe(true);
    expect(anchorValidation.isValid).toBe(true);
    expect(boostValidation.isValid).toBe(true);
  });

});

describe('Cross-Personality Boundary Enforcement', () => {

  test('Each personality forbids other personalities signature phrases', () => {
    // AI Meltdown should forbid Anti-Guru phrases
    const glitchPersonality = resolvePersonality('ai_meltdown');
    expect(glitchPersonality.vocabulary?.forbiddenPhrases).toContain('brutal truth');
    
    // Anti-Guru should forbid AI Meltdown phrases  
    const anchorPersonality = resolvePersonality('anti_guru');
    expect(anchorPersonality.vocabulary?.forbiddenPhrases).toContain('allegedly');
    
    // Rocket should forbid both others' phrases
    const boostPersonality = resolvePersonality('rocket_future');
    expect(boostPersonality.vocabulary?.forbiddenPhrases).toContain('brutal truth');
    expect(boostPersonality.vocabulary?.forbiddenPhrases).toContain('allegedly');
  });

  test('System prompts explicitly state correct primary trait', () => {
    const glitchPersonality = resolvePersonality('ai_meltdown');
    const anchorPersonality = resolvePersonality('anti_guru');
    const boostPersonality = resolvePersonality('rocket_future');
    
    expect(glitchPersonality.systemPromptSuffix?.toLowerCase()).toContain('sarcastic');
    expect(anchorPersonality.systemPromptSuffix?.toLowerCase()).toContain('brutally honest');
    expect(boostPersonality.systemPromptSuffix?.toLowerCase()).toContain('encouraging');
  });

});

describe('Historical Regression Prevention', () => {

  test('AI Meltdown is no longer "unraveling" or "chaotic"', () => {
    const personality = resolvePersonality('ai_meltdown');
    
    expect(personality.authorityTone).not.toBe('unraveling');
    expect(personality.visuals.motionProfile).not.toBe('unstable');
    expect(personality.authorityTone).toBe('sarcastic');
  });

  test('Anti-Guru is no longer just "dry" - now brutally honest', () => {
    const personality = resolvePersonality('anti_guru');
    
    expect(personality.authorityTone).toBe('brutally_honest');
    expect(personality.authorityTone).not.toBe('blunt'); // Was too weak
    expect(personality.systemPromptSuffix).toContain('BRUTALLY HONEST');
  });

  test('Rocket Future is properly encouraging not just "calm"', () => {
    const personality = resolvePersonality('rocket_future');
    
    expect(personality.authorityTone).toBe('encouraging');
    expect(personality.authorityTone).not.toBe('calm'); // Was too passive
    expect(personality.vocabulary?.preferredPhrases).toContain('You\'ve got this!');
  });

});