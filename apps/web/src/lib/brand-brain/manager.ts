import { BrandBrain, BrandBrainValidation, ContentValidation } from '@/types/brand-brain';
import { defaultBrandBrain } from './default-profile';

/**
 * BrandBrain Manager - Core utility for working with brand configurations
 */
export class BrandBrainManager {
  private brandBrain: BrandBrain | null = null;

  constructor(brandBrain?: BrandBrain) {
    this.brandBrain = brandBrain || null;
  }

  /**
   * Get the current brand brain or default
   */
  getBrandBrain(): Omit<BrandBrain, 'id' | 'createdAt' | 'updatedAt' | 'userId'> {
    return this.brandBrain || defaultBrandBrain;
  }

  /**
   * Validate a BrandBrain configuration
   */
  validate(brandBrain: Partial<BrandBrain>): BrandBrainValidation {
    const errors: BrandBrainValidation['errors'] = [];
    const warnings: BrandBrainValidation['warnings'] = [];

    // Validate PersonalityProfile
    if (!brandBrain.personalityProfile?.brandName) {
      errors.push({ field: 'personalityProfile.brandName', message: 'Brand name is required' });
    }

    if (brandBrain.personalityProfile?.identity?.values?.length === 0) {
      warnings.push({ field: 'personalityProfile.identity.values', message: 'Consider adding brand values' });
    }

    // Validate UIBehaviorConstraints
    if (brandBrain.uiBehaviorConstraints?.visual?.primaryColor && 
        !this.isValidHexColor(brandBrain.uiBehaviorConstraints.visual.primaryColor)) {
      errors.push({ field: 'uiBehaviorConstraints.visual.primaryColor', message: 'Invalid hex color format' });
    }

    // Validate AIPromptRules
    if (brandBrain.aiPromptRules?.systemInstructions?.mustInclude?.length === 0) {
      warnings.push({ field: 'aiPromptRules.systemInstructions.mustInclude', message: 'Consider adding AI instructions' });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate content against BrandBrain rules
   */
  validateContent(content: string, brandBrainId: string): ContentValidation {
    const brain = this.getBrandBrain();
    const violations: ContentValidation['violations'] = [];
    let score = 100;

    // Check for forbidden claims
    brain.forbiddenClaims.legal.financialGuarantees.forEach(claim => {
      if (content.toLowerCase().includes(claim.toLowerCase())) {
        violations.push({
          type: 'forbidden-claim',
          severity: 'error',
          message: `Contains forbidden financial guarantee: "${claim}"`,
          suggestion: 'Remove or rephrase to avoid making unrealistic promises'
        });
        score -= 15;
      }
    });

    brain.forbiddenClaims.legal.absoluteStatements.forEach(statement => {
      if (content.toLowerCase().includes(statement.toLowerCase())) {
        violations.push({
          type: 'forbidden-claim',
          severity: 'warning',
          message: `Contains absolute statement: "${statement}"`,
          suggestion: 'Consider using more measured language'
        });
        score -= 5;
      }
    });

    // Check word choices
    brain.soundPolicy.wordChoice.avoid.forEach(word => {
      if (content.toLowerCase().includes(word.toLowerCase())) {
        violations.push({
          type: 'word-choice',
          severity: 'warning',
          message: `Contains discouraged phrase: "${word}"`,
          suggestion: 'Consider using alternative phrasing from brand guidelines'
        });
        score -= 3;
      }
    });

    // Check length constraints if applicable
    const wordCount = content.split(/\s+/).length;
    if (brain.aiPromptRules.contentGeneration.maxLength && 
        wordCount > brain.aiPromptRules.contentGeneration.maxLength) {
      violations.push({
        type: 'length-violation',
        severity: 'warning',
        message: `Content exceeds maximum length (${wordCount} words)`,
        suggestion: `Reduce to ${brain.aiPromptRules.contentGeneration.maxLength} words or less`
      });
      score -= 5;
    }

    return {
      content,
      brandBrainId,
      violations,
      score: Math.max(0, score),
      approved: violations.filter(v => v.severity === 'error').length === 0
    };
  }

  /**
   * Generate AI system prompt from BrandBrain
   */
  generateAISystemPrompt(): string {
    const brain = this.getBrandBrain();
    const profile = brain.personalityProfile;
    const rules = brain.aiPromptRules;

    let prompt = `You are an AI assistant for ${profile.brandName}.\n\n`;
    
    prompt += `BRAND MISSION: ${profile.identity.mission}\n\n`;
    
    prompt += `BRAND VALUES:\n${profile.identity.values.map(v => `- ${v}`).join('\n')}\n\n`;
    
    prompt += `VOICE & TONE:\n`;
    prompt += `- Overall tone: ${profile.voice.tone}\n`;
    prompt += `- Personality traits: ${profile.voice.traits.join(', ')}\n`;
    prompt += `- Formality level: ${profile.voice.formalityLevel}/5\n`;
    prompt += `- Humor: ${profile.voice.humorLevel}\n\n`;
    
    prompt += `YOU MUST:\n${rules.systemInstructions.mustInclude.map(i => `- ${i}`).join('\n')}\n\n`;
    
    prompt += `YOU MUST NOT:\n${rules.systemInstructions.mustAvoid.map(a => `- ${a}`).join('\n')}\n\n`;
    
    prompt += `RESPONSE STRUCTURE: ${rules.systemInstructions.responseStructure}\n\n`;
    
    prompt += `FORBIDDEN CLAIMS (Never make these claims):\n`;
    prompt += `Financial: ${brain.forbiddenClaims.legal.financialGuarantees.join(', ')}\n`;
    prompt += `Absolute statements: ${brain.forbiddenClaims.legal.absoluteStatements.join(', ')}\n\n`;
    
    prompt += `PREFERRED LANGUAGE:\n${brain.soundPolicy.wordChoice.preferred.join(', ')}\n\n`;
    
    prompt += `AVOID THESE WORDS/PHRASES:\n${brain.soundPolicy.wordChoice.avoid.join(', ')}\n`;

    return prompt;
  }

  /**
   * Get UI theme from BrandBrain
   */
  getUITheme() {
    const brain = this.getBrandBrain();
    return {
      colors: {
        primary: brain.uiBehaviorConstraints.visual.primaryColor,
        secondary: brain.uiBehaviorConstraints.visual.secondaryColor,
        accent: brain.uiBehaviorConstraints.visual.accentColor,
      },
      fontFamily: brain.uiBehaviorConstraints.visual.fontFamily,
      borderRadius: brain.uiBehaviorConstraints.visual.borderRadius,
      animations: brain.uiBehaviorConstraints.visual.animations,
    };
  }

  /**
   * Get messaging guidelines
   */
  getMessagingGuidelines() {
    const brain = this.getBrandBrain();
    return {
      voice: brain.personalityProfile.voice,
      soundPolicy: brain.soundPolicy,
      copyConstraints: brain.uiBehaviorConstraints.copy,
    };
  }

  /**
   * Check if content requires FTC disclosure
   */
  requiresDisclosure(content: string): boolean {
    const affiliateKeywords = ['affiliate', 'commission', 'partner', 'sponsored'];
    return affiliateKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );
  }

  /**
   * Generate FTC disclosure text
   */
  generateDisclosure(): string {
    return "Disclosure: This post contains affiliate links. If you make a purchase through these links, we may earn a commission at no additional cost to you. We only recommend products we personally use or believe will add value to our readers.";
  }

  // Helper methods
  private isValidHexColor(hex: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
  }
}

/**
 * Singleton instance for easy access
 */
let globalBrandBrainManager: BrandBrainManager | null = null;

export function getBrandBrainManager(brandBrain?: BrandBrain): BrandBrainManager {
  if (!globalBrandBrainManager || brandBrain) {
    globalBrandBrainManager = new BrandBrainManager(brandBrain);
  }
  return globalBrandBrainManager;
}

/**
 * Reset the global manager (useful for testing or switching brands)
 */
export function resetBrandBrainManager(): void {
  globalBrandBrainManager = null;
}
