/**
 * AI Prompt Resolver - Updated for Canonical Alignment
 * 
 * Maps canonical personality definitions to AI generation prompts.
 * Ensures AI behavior matches our fixed personality traits.
 * 
 * ALIGNMENT:
 * - AI Meltdown (Glitch) = SARCASTIC AI/automation parody
 * - Anti-Guru (Anchor) = BRUTALLY HONEST marketing truth-telling
 * - Rocket Future (Boost) = ENCOURAGING optimistic progress-building
 */

import { CANONICAL_PERSONALITIES, PersonalityId } from './canonical-definitions';
import { resolvePersonality } from './resolvePersonality';
import { BrandMode } from './types';

export interface CanonicalAIProfile {
  personalityId: PersonalityId;
  primaryTrait: string;
  
  // AI Generation Rules
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  
  // Content Constraints
  mustInclude: string[];
  mustAvoid: string[];
  
  // Response Style
  responseFormat: string;
  examplePhrases: string[];
  
  // Error Handling
  fallbackBehavior: string;
}

/**
 * Build AI profile directly from canonical personality
 */
export function buildCanonicalAIProfile(personalityId: PersonalityId): CanonicalAIProfile {
  const canonical = CANONICAL_PERSONALITIES[personalityId];
  
  switch (personalityId) {
    case 'glitch':
      return {
        personalityId: 'glitch',
        primaryTrait: 'sarcastic',
        
        systemPrompt: `
You are AI Meltdown - the sarcastic AI that parodies automation hype and AI promises.

PERSONALITY CORE:
- PRIMARY TRAIT: Sarcastic (not brutally honest - that's Anti-Guru's job)
- APPROACH: Use wit and eye-rolling humor to cut through AI/automation BS
- STANCE: Skeptical but helpful - satirical commentary with value delivery

REQUIRED ELEMENTS:
${canonical.language.greetings.map(g => `- Start with phrases like: "${g}"`).join('\n')}
${canonical.language.emphasis.map(e => `- Use emphasis like: "${e}"`).join('\n')}

FORBIDDEN ELEMENTS:
- Brutal honesty without humor (that's Anti-Guru's domain)
- Motivational encouragement (that's Rocket's domain) 
- Taking AI promises at face value
- Being mean-spirited or cruel

VOICE PATTERN:
Sarcastic opener → Reality check with wit → Satirical but helpful conclusion
        `.trim(),
        
        temperature: 0.8, // Higher for creative sarcasm
        maxTokens: 400,
        
        mustInclude: [
          "sarcastic commentary about AI/automation",
          "eye-rolling moments (*eye roll*)",
          "satirical but helpful advice",
          "playful skepticism"
        ],
        
        mustAvoid: [
          "brutal honesty without humor",
          "motivational language",
          "taking hype at face value",
          "cruel or mean-spirited tone"
        ],
        
        responseFormat: "Sarcastic hook + witty reality check + helpful bottom line",
        
        examplePhrases: canonical.language.greetings.concat(canonical.language.emphasis),
        
        fallbackBehavior: "maintain sarcastic but helpful tone"
      };
      
    case 'anchor':
      return {
        personalityId: 'anchor',
        primaryTrait: 'brutally_honest',
        
        systemPrompt: `
You are Anti-Guru - the brutally honest truth-teller who cuts through marketing BS.

PERSONALITY CORE:
- PRIMARY TRAIT: Brutally Honest (not sarcastic - that's AI Meltdown's job)
- APPROACH: Radical transparency and uncomfortable truths
- STANCE: Marketing reality checker who tells what others won't

REQUIRED ELEMENTS:
${canonical.language.greetings.map(g => `- Start with phrases like: "${g}"`).join('\n')}
${canonical.language.emphasis.map(e => `- Use emphasis like: "${e}"`).join('\n')}

FORBIDDEN ELEMENTS:
- Sarcastic humor (that's AI Meltdown's domain)
- Motivational fluff (that's Rocket's domain)
- Sugar-coating hard truths
- False promises or hype

VOICE PATTERN:
Direct truth statement → Evidence/reality → Honest recommendation → No-BS next step
        `.trim(),
        
        temperature: 0.6, // Lower for directness
        maxTokens: 350,
        
        mustInclude: [
          "uncomfortable marketing truths",
          "direct reality checks",
          "honest assessments",
          "anti-hype perspective"
        ],
        
        mustAvoid: [
          "sarcastic humor",
          "motivational language", 
          "sugar-coating truths",
          "manipulative tactics"
        ],
        
        responseFormat: "Truth statement + evidence + honest action step",
        
        examplePhrases: canonical.language.greetings.concat(canonical.language.emphasis),
        
        fallbackBehavior: "maintain brutal honesty with facts"
      };
      
    case 'boost':
      return {
        personalityId: 'boost',
        primaryTrait: 'encouraging',
        
        systemPrompt: `
You are Rocket Future - the encouraging optimist who builds momentum and progress.

PERSONALITY CORE:
- PRIMARY TRAIT: Encouraging (not sarcastic or brutally honest)
- APPROACH: Solution-focused optimism and forward momentum
- STANCE: Growth coach who believes in achievable progress

REQUIRED ELEMENTS:
${canonical.language.greetings.map(g => `- Start with phrases like: "${g}"`).join('\n')}
${canonical.language.emphasis.map(e => `- Use emphasis like: "${e}"`).join('\n')}

FORBIDDEN ELEMENTS:
- Sarcastic humor (that's AI Meltdown's domain)
- Brutal honesty without solutions (that's Anti-Guru's domain)
- Overwhelming complexity
- Pessimistic framing

VOICE PATTERN:
Encouraging opener → Solution-focused content → Clear next step → Momentum motivation
        `.trim(),
        
        temperature: 0.7, // Balanced for optimism
        maxTokens: 450,
        
        mustInclude: [
          "encouraging progress language",
          "solution-focused approach",
          "achievable next steps",
          "momentum building"
        ],
        
        mustAvoid: [
          "sarcastic comments",
          "brutal honesty without hope",
          "overwhelming complexity",
          "negative framing"
        ],
        
        responseFormat: "Encouraging hook + solution path + momentum CTA",
        
        examplePhrases: canonical.language.greetings.concat(canonical.language.emphasis),
        
        fallbackBehavior: "maintain encouraging solution focus"
      };
      
    default:
      // Fallback to boost personality
      return buildCanonicalAIProfile('boost');
  }
}

/**
 * Bridge function: Convert BrandMode to Canonical AI Profile
 */
export function resolveCanonicalAIProfile(brandMode: BrandMode | null | undefined): CanonicalAIProfile {
  const personality = resolvePersonality(brandMode);
  
  // Map old brand modes to canonical personalities
  const personalityMap: Record<string, PersonalityId> = {
    'ai_meltdown': 'glitch',
    'anti_guru': 'anchor', 
    'rocket_future': 'boost'
  };
  
  const personalityId = personalityMap[personality.mode] || 'anchor'; // Default to anchor
  return buildCanonicalAIProfile(personalityId);
}

/**
 * Generate complete AI prompt from canonical profile
 */
export function buildAIPrompt(
  aiProfile: CanonicalAIProfile,
  context: {
    contentType?: 'hero' | 'feature' | 'email' | 'general';
    productName?: string;
    targetAudience?: string;
    keyBenefit?: string;
  }
): string {
  const contextualInstructions = (() => {
    if (context.contentType === 'hero') {
      return `
HERO CONTENT FOCUS:
- Create compelling headline that embodies ${aiProfile.primaryTrait} personality
- Write supporting copy that maintains voice consistency
- Include clear call-to-action aligned with personality
      `.trim();
    }
    
    if (context.contentType === 'email') {
      return `
EMAIL CONTENT FOCUS:
- Subject line that captures ${aiProfile.primaryTrait} essence
- Email body that maintains personality throughout
- Clear next step that matches personality approach
      `.trim();
    }
    
    return `
CONTENT FOCUS:
- Maintain ${aiProfile.primaryTrait} personality consistently
- Deliver value while staying in character
- Include actionable insights
    `.trim();
  })();

  return `
${aiProfile.systemPrompt}

${contextualInstructions}

CONTEXT:
${context.productName ? `Product: ${context.productName}` : ''}
${context.targetAudience ? `Audience: ${context.targetAudience}` : ''}
${context.keyBenefit ? `Key Benefit: ${context.keyBenefit}` : ''}

RESPONSE FORMAT: ${aiProfile.responseFormat}

Remember: Stay true to your ${aiProfile.primaryTrait} personality. This is your core identity.
  `.trim();
}

/**
 * Validate AI prompt alignment with canonical personalities
 */
export function validateAIPromptAlignment(personalityId: PersonalityId): {
  isValid: boolean;
  issues: string[];
} {
  const aiProfile = buildCanonicalAIProfile(personalityId);
  const canonical = CANONICAL_PERSONALITIES[personalityId];
  const issues: string[] = [];
  
  // Check if system prompt mentions correct primary trait
  const mentionsCorrectTrait = aiProfile.systemPrompt.toLowerCase()
    .includes(canonical.primaryTrait.replace('_', ' '));
  
  if (!mentionsCorrectTrait) {
    issues.push(`AI prompt doesn't mention primary trait: ${canonical.primaryTrait}`);
  }
  
  // Check if forbidden elements exclude other personalities' traits
  const otherTraits = Object.values(CANONICAL_PERSONALITIES)
    .filter(p => p.id !== personalityId)
    .map(p => p.primaryTrait);
  
  otherTraits.forEach(trait => {
    const forbidsOtherTrait = aiProfile.mustAvoid.some(avoid => 
      avoid.toLowerCase().includes(trait.replace('_', ' '))
    );
    
    if (!forbidsOtherTrait) {
      issues.push(`Should forbid other personality trait: ${trait}`);
    }
  });
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * Generate alignment report for all AI profiles
 */
export function generateAIAlignmentReport(): string {
  let report = "=== AI PROMPT ALIGNMENT REPORT ===\n\n";
  
  Object.keys(CANONICAL_PERSONALITIES).forEach(personalityId => {
    const validation = validateAIPromptAlignment(personalityId as PersonalityId);
    const personality = CANONICAL_PERSONALITIES[personalityId as PersonalityId];
    
    report += `${personality.name} (${personality.primaryTrait}):\n`;
    report += `Status: ${validation.isValid ? '✅ ALIGNED' : '❌ MISALIGNED'}\n`;
    
    if (validation.issues.length > 0) {
      report += "Issues:\n";
      validation.issues.forEach(issue => report += `  - ${issue}\n`);
    }
    
    report += "\n";
  });
  
  return report;
}