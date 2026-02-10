/**
 * Brand Brain Validation Rules
 * 
 * Validates that Brand Brain profiles maintain alignment with canonical personalities.
 * Prevents personality trait drift during updates or modifications.
 */

import { BrandBrain } from '@/types/brand-brain';
import { CANONICAL_PERSONALITIES } from '../personality/canonical-definitions';
import { PERSONALITY_BRAND_BRAINS } from './personality-profiles';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate that a Brand Brain profile maintains personality alignment
 */
export function validateBrandBrainAlignment(brandBrain: BrandBrain): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Check if this is a known personality
  const brandName = brandBrain.personalityProfile.brandName;
  const canonicalPersonality = Object.values(CANONICAL_PERSONALITIES)
    .find(p => p.name === brandName);

  if (!canonicalPersonality) {
    result.warnings.push(`Brand name "${brandName}" does not match any canonical personality`);
    return result;
  }

  const tone = brandBrain.personalityProfile.voice.tone;
  const expectedTrait = canonicalPersonality.primaryTrait;

  // Validate primary trait alignment
  if (!isTraitAligned(tone, expectedTrait)) {
    result.isValid = false;
    result.errors.push(
      `Personality "${brandName}" has tone "${tone}" but should have primary trait "${expectedTrait}"`
    );
  }

  // Validate forbidden phrases don't contain other personalities' signature phrases
  const forbiddenPhrases = brandBrain.aiPromptRules.systemInstructions.mustAvoid;
  const crossContamination = checkCrossContamination(brandName, forbiddenPhrases);
  
  if (crossContamination.length > 0) {
    result.warnings.push(...crossContamination);
  }

  // Validate system instructions mention correct trait
  const systemInstructions = brandBrain.aiPromptRules.systemInstructions.mustInclude;
  const mentionsCorrectTrait = systemInstructions.some(instruction => 
    instruction.toLowerCase().includes(expectedTrait.replace('_', ' '))
  );

  if (!mentionsCorrectTrait) {
    result.warnings.push(
      `System instructions for "${brandName}" don't explicitly mention "${expectedTrait}"`
    );
  }

  return result;
}

/**
 * Check if tone aligns with expected primary trait
 */
function isTraitAligned(tone: string, expectedTrait: string): boolean {
  const alignmentMap: Record<string, string[]> = {
    'sarcastic': ['sarcastic', 'satirical', 'witty'],
    'brutally_honest': ['brutally_honest', 'direct', 'blunt'],
    'encouraging': ['encouraging', 'optimistic', 'supportive']
  };

  const validTones = alignmentMap[expectedTrait] || [];
  return validTones.includes(tone);
}

/**
 * Check for cross-contamination between personalities
 */
function checkCrossContamination(brandName: string, forbiddenPhrases: string[]): string[] {
  const contamination: string[] = [];

  // Define signature phrases for each personality
  const signatures = {
    'AI Meltdown': ['*eye roll*', 'allegedly', 'let me guess'],
    'Anti-Guru': ['brutal truth', 'no BS', 'cut the BS'],
    'Rocket Future': ['you\'ve got this', 'progress over perfection', 'forward momentum']
  };

  // Check if this personality is using forbidden phrases from others
  Object.entries(signatures).forEach(([otherPersonality, phrases]) => {
    if (otherPersonality === brandName) return; // Skip self

    phrases.forEach(phrase => {
      const isInForbidden = forbiddenPhrases.some(forbidden => 
        forbidden.toLowerCase().includes(phrase.toLowerCase())
      );
      
      if (!isInForbidden) {
        contamination.push(
          `"${brandName}" should forbid "${phrase}" (belongs to ${otherPersonality})`
        );
      }
    });
  });

  return contamination;
}

/**
 * Validate all personality Brand Brain profiles
 */
export function validateAllPersonalityProfiles(): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  Object.entries(PERSONALITY_BRAND_BRAINS).forEach(([personalityId, brandBrain]) => {
    // Convert to full BrandBrain object for validation
    const fullBrandBrain: BrandBrain = {
      ...brandBrain,
      id: `test-${personalityId}`,
      userId: 'test-user',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const validation = validateBrandBrainAlignment(fullBrandBrain);
    
    if (!validation.isValid) {
      result.isValid = false;
      result.errors.push(`${personalityId}: ${validation.errors.join(', ')}`);
    }
    
    if (validation.warnings.length > 0) {
      result.warnings.push(`${personalityId}: ${validation.warnings.join(', ')}`);
    }
  });

  return result;
}

/**
 * Quick validation check for personality trait alignment
 */
export function checkPersonalityAlignment(): {
  glitchIsSarcastic: boolean;
  anchorIsBrutallyHonest: boolean;
  boostIsEncouraging: boolean;
  allAligned: boolean;
} {
  const glitchTone = PERSONALITY_BRAND_BRAINS.glitch.personalityProfile.voice.tone;
  const anchorTone = PERSONALITY_BRAND_BRAINS.anchor.personalityProfile.voice.tone;
  const boostTone = PERSONALITY_BRAND_BRAINS.boost.personalityProfile.voice.tone;

  return {
    glitchIsSarcastic: glitchTone === 'sarcastic',
    anchorIsBrutallyHonest: anchorTone === 'brutally_honest',
    boostIsEncouraging: boostTone === 'encouraging',
    allAligned: glitchTone === 'sarcastic' && anchorTone === 'brutally_honest' && boostTone === 'encouraging'
  };
}

/**
 * Generate validation report for debugging
 */
export function generateValidationReport(): string {
  const profileValidation = validateAllPersonalityProfiles();
  const alignmentCheck = checkPersonalityAlignment();
  
  let report = "=== PERSONALITY ALIGNMENT VALIDATION REPORT ===\n\n";
  
  report += "Quick Alignment Check:\n";
  report += `- AI Meltdown is sarcastic: ${alignmentCheck.glitchIsSarcastic ? '✅' : '❌'}\n`;
  report += `- Anti-Guru is brutally honest: ${alignmentCheck.anchorIsBrutallyHonest ? '✅' : '❌'}\n`;
  report += `- Rocket Future is encouraging: ${alignmentCheck.boostIsEncouraging ? '✅' : '❌'}\n`;
  report += `- All personalities aligned: ${alignmentCheck.allAligned ? '✅' : '❌'}\n\n`;
  
  report += `Detailed Validation: ${profileValidation.isValid ? '✅ PASSED' : '❌ FAILED'}\n\n`;
  
  if (profileValidation.errors.length > 0) {
    report += "ERRORS:\n";
    profileValidation.errors.forEach(error => report += `- ${error}\n`);
    report += "\n";
  }
  
  if (profileValidation.warnings.length > 0) {
    report += "WARNINGS:\n";
    profileValidation.warnings.forEach(warning => report += `- ${warning}\n`);
  }
  
  return report;
}
