/**
 * BrandBrain: A comprehensive brand personality and compliance system
 * 
 * BrandBrain = PersonalityProfile + AI Prompt Rules + UI Behavior Constraints 
 *              + Sound Policy + Forbidden Claims
 */

export interface PersonalityProfile {
  /** Brand name */
  brandName: string;
  
  /** Core brand identity */
  identity: {
    /** One-line brand mission */
    mission: string;
    /** Core values (3-5 key values) */
    values: string[];
    /** Target audience description */
    targetAudience: string;
    /** Brand archetype (e.g., "The Hero", "The Sage", "The Maverick") */
    archetype: string;
  };
  
  /** Tone and voice guidelines */
  voice: {
    /** Overall tone (e.g., "professional", "casual", "authoritative") */
    tone: "professional" | "casual" | "friendly" | "authoritative" | "playful" | "empathetic" | "inspirational";
    /** Personality traits (e.g., ["confident", "helpful", "innovative"]) */
    traits: string[];
    /** Formality level (1-5, where 1 is very casual, 5 is very formal) */
    formalityLevel: 1 | 2 | 3 | 4 | 5;
    /** Use of humor (none, subtle, moderate, heavy) */
    humorLevel: "none" | "subtle" | "moderate" | "heavy";
    /** Emoji usage policy */
    emojiUsage: "never" | "rare" | "moderate" | "frequent";
  };
  
  /** Language and style preferences */
  language: {
    /** Preferred vocabulary complexity */
    complexity: "simple" | "moderate" | "advanced";
    /** Sentence structure preference */
    sentenceStructure: "short" | "varied" | "complex";
    /** Active vs passive voice preference */
    voicePreference: "active" | "mixed" | "passive";
    /** Jargon policy */
    jargonPolicy: "avoid" | "minimal" | "moderate" | "technical-ok";
  };
}

export interface AIPromptRules {
  /** System-level instructions for AI */
  systemInstructions: {
    /** Always include these guidelines in prompts */
    mustInclude: string[];
    /** Never include these in responses */
    mustAvoid: string[];
    /** Preferred response structure */
    responseStructure: string;
  };
  
  /** Content generation rules */
  contentGeneration: {
    /** Maximum response length (in words) */
    maxLength?: number;
    /** Minimum response length (in words) */
    minLength?: number;
    /** Required content sections */
    requiredSections?: string[];
    /** Preferred content format */
    preferredFormat: "paragraphs" | "bullet-points" | "mixed" | "storytelling";
    /** Call-to-action style */
    ctaStyle: "direct" | "soft" | "question-based" | "benefit-focused";
  };
  
  /** Fact-checking and accuracy */
  accuracy: {
    /** Require citations for claims */
    requireCitations: boolean;
    /** Allow speculative content */
    allowSpeculation: boolean;
    /** Fact verification level */
    verificationLevel: "strict" | "moderate" | "relaxed";
  };
  
  /** Brand-specific prompt templates */
  customPromptTemplates: {
    /** Template name */
    name: string;
    /** Template content */
    template: string;
    /** When to use this template */
    useCase: string;
  }[];
}

export interface UIBehaviorConstraints {
  /** Visual design constraints */
  visual: {
    /** Primary brand color (hex) */
    primaryColor: string;
    /** Secondary brand color (hex) */
    secondaryColor: string;
    /** Accent color (hex) */
    accentColor: string;
    /** Font family */
    fontFamily: string;
    /** Border radius style */
    borderRadius: "sharp" | "subtle" | "rounded" | "pill";
    /** Animation preference */
    animations: "none" | "subtle" | "moderate" | "dynamic";
  };
  
  /** Copy constraints */
  copy: {
    /** Headline style */
    headlineStyle: "benefit-driven" | "question-based" | "statement" | "how-to";
    /** Button text style */
    buttonTextStyle: "action-verb" | "benefit" | "directive" | "question";
    /** Maximum headline length (characters) */
    maxHeadlineLength: number;
    /** Maximum button text length (characters) */
    maxButtonLength: number;
  };
  
  /** User interaction rules */
  interaction: {
    /** Confirmation required for actions */
    requireConfirmation: string[];
    /** Auto-save behavior */
    autoSave: boolean;
    /** Loading state style */
    loadingStyle: "spinner" | "skeleton" | "progress-bar" | "dots";
    /** Error message style */
    errorStyle: "toast" | "inline" | "modal" | "banner";
  };
  
  /** Accessibility requirements */
  accessibility: {
    /** WCAG compliance level */
    wcagLevel: "A" | "AA" | "AAA";
    /** Minimum contrast ratio */
    minContrastRatio: 3 | 4.5 | 7;
    /** Keyboard navigation required */
    keyboardNav: boolean;
    /** Screen reader optimization */
    screenReaderOptimized: boolean;
  };
}

export type UIExpressionProfile = {
  hero: {
    variants: ('meltdown' | 'anti-guru' | 'rocket')[];
    motionIntensity: 'none' | 'low' | 'medium' | 'high';
    visualNoise: 'none' | 'controlled' | 'expressive';
  };

  typography: {
    tone: 'flat' | 'confident' | 'playful' | 'fractured';
    emphasisStyle: 'none' | 'underline' | 'highlight' | 'strike';
  };

  surfaces: {
    depth: 'flat' | 'soft' | 'layered';
    borderStyle: 'sharp' | 'rounded' | 'mixed';
  };

  microInteractions: {
    hoverAllowed: boolean;
    glitchAllowed: boolean;
    pulseAllowed: boolean;
  };

  sound: {
    ambientProfiles: ('checklist' | 'hum' | 'glitch')[];
    maxVolume: number;
  };
};

export interface SoundPolicy {
  /** Overall brand voice characteristics */
  voiceCharacteristics: {
    /** Positive attributes to embody */
    shouldBe: string[];
    /** Negative attributes to avoid */
    shouldNotBe: string[];
  };
  
  /** Word choice guidelines */
  wordChoice: {
    /** Preferred words/phrases */
    preferred: string[];
    /** Words to avoid */
    avoid: string[];
    /** Inclusive language requirements */
    inclusivityRules: string[];
  };
  
  /** Messaging frameworks */
  messaging: {
    /** Problem-solution framing */
    problemSolutionFraming: boolean;
    /** Benefit-focused messaging */
    benefitFocused: boolean;
    /** Social proof usage */
    socialProofStyle: "testimonials" | "stats" | "case-studies" | "endorsements" | "mixed";
    /** Urgency and scarcity usage */
    urgencyPolicy: "never" | "subtle" | "moderate" | "aggressive";
  };
  
  /** Customer communication style */
  customerCommunication: {
    /** How to address customers */
    addressStyle: "first-name" | "formal" | "friendly" | "professional";
    /** Empathy level in responses */
    empathyLevel: "low" | "moderate" | "high";
    /** Response time expectations */
    responseTimePromise?: string;
  };
}

export interface ForbiddenClaims {
  /** Legal compliance */
  legal: {
    /** Health claims to avoid */
    healthClaims: string[];
    /** Financial guarantees to avoid */
    financialGuarantees: string[];
    /** Absolute statements to avoid */
    absoluteStatements: string[];
    /** Competitor mentions policy */
    competitorMentions: "never" | "factual-only" | "comparative-ok";
  };
  
  /** Regulatory compliance */
  regulatory: {
    /** FTC disclosure requirements */
    ftcDisclosures: string[];
    /** GDPR compliance notes */
    gdprCompliance: string[];
    /** Industry-specific regulations */
    industryRegulations: string[];
  };
  
  /** Ethical guidelines */
  ethics: {
    /** Claims that exploit vulnerabilities */
    exploitativeClaims: string[];
    /** Fear-based marketing limits */
    fearMongeringLimits: string[];
    /** Transparency requirements */
    transparencyRules: string[];
  };
  
  /** Content restrictions */
  contentRestrictions: {
    /** Prohibited topics */
    prohibitedTopics: string[];
    /** Sensitive topics requiring approval */
    sensitiveTopics: string[];
    /** Age-restricted content policy */
    ageRestrictions?: string;
  };
}

/**
 * Complete BrandBrain configuration
 */
export interface BrandBrain {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  
  /** Is this the active brand profile */
  isActive: boolean;
  
  /** User/Organization ID */
  userId: string;
  
  /** Brand components */
  personalityProfile: PersonalityProfile;
  aiPromptRules: AIPromptRules;
  uiBehaviorConstraints: UIBehaviorConstraints;
  uiExpressionProfile: UIExpressionProfile;
  soundPolicy: SoundPolicy;
  forbiddenClaims: ForbiddenClaims;
  
  /** Metadata */
  metadata?: {
    version: string;
    lastReviewedDate?: Date;
    reviewedBy?: string;
    notes?: string;
  };
}

/**
 * BrandBrain validation result
 */
export interface BrandBrainValidation {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
  }[];
  warnings: {
    field: string;
    message: string;
  }[];
}

/**
 * Content validation against BrandBrain rules
 */
export interface ContentValidation {
  content: string;
  brandBrainId: string;
  violations: {
    type: "forbidden-claim" | "tone-mismatch" | "length-violation" | "word-choice" | "other";
    severity: "error" | "warning" | "info";
    message: string;
    suggestion?: string;
  }[];
  score: number; // 0-100, how well it aligns with brand
  approved: boolean;
}
