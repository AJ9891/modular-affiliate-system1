import { BrandBrain, type UIExpressionProfile } from '@/types/brand-brain';
import { CANONICAL_PERSONALITIES } from '../personality/canonical-definitions';

const DEFAULT_UI_EXPRESSION: UIExpressionProfile = {
  hero: {
    variants: ['meltdown', 'anti-guru', 'rocket'] as ('meltdown' | 'anti-guru' | 'rocket')[],
    motionIntensity: 'medium',
    visualNoise: 'controlled'
  },
  typography: {
    tone: 'confident' as const,
    emphasisStyle: 'highlight' as const
  },
  surfaces: {
    depth: 'layered' as const,
    borderStyle: 'sharp' as const
  },
  microInteractions: {
    hoverAllowed: true,
    glitchAllowed: true,
    pulseAllowed: false
  },
  sound: {
    ambientProfiles: ['glitch'] as ('checklist' | 'hum' | 'glitch')[],
    maxVolume: 60
  }
};

const DEFAULT_SOUND_POLICY = {
  voiceCharacteristics: {
    shouldBe: ['helpful', 'clear', 'on-brand'],
    shouldNotBe: ['deceptive', 'manipulative', 'overpromising']
  },
  wordChoice: {
    preferred: ['transparent', 'practical', 'specific'],
    avoid: ['guaranteed', 'overnight', 'secret'],
    inclusivityRules: ['use inclusive language', 'avoid gendered terms unless required']
  },
  messaging: {
    problemSolutionFraming: true,
    benefitFocused: true,
    socialProofStyle: 'mixed' as const,
    urgencyPolicy: 'subtle' as const
  },
  customerCommunication: {
    addressStyle: 'friendly' as const,
    empathyLevel: 'moderate' as const,
    responseTimePromise: 'Within 24 hours'
  }
};

const DEFAULT_FORBIDDEN_CLAIMS = {
  legal: {
    healthClaims: ['Cure, prevent, or treat diseases'],
    financialGuarantees: ['Guaranteed income', 'Get rich quick'],
    absoluteStatements: ['Always works', '100% success'],
    competitorMentions: 'factual-only' as const
  },
  regulatory: {
    ftcDisclosures: ['Include affiliate disclosures where required'],
    gdprCompliance: ['Do not store personal data without consent'],
    industryRegulations: ['Follow email marketing laws (CAN-SPAM)']
  },
  ethics: {
    exploitativeClaims: ['Fear-based manipulation', 'Shaming the user'],
    fearMongeringLimits: ['No false urgency', 'Avoid scare tactics'],
    transparencyRules: ['Be clear about limitations', 'No hidden fees']
  },
  contentRestrictions: {
    prohibitedTopics: ['Hate speech', 'Illegal activities'],
    sensitiveTopics: ['Medical advice', 'Financial advice'],
    ageRestrictions: '18+ content requires gating'
  }
};

/**
 * Brand Brain Personality Profiles
 * 
 * These profiles translate the canonical personality definitions into 
 * the BrandBrain format for AI prompts and UI constraints.
 * 
 * ALIGNMENT CHECK:
 * - Glitch = Sarcastic (AI/automation parody)
 * - Anchor = Brutally Honest (anti-hype truth-telling)
 * - Boost = Encouraging (optimistic solution-focus)
 */

export const GLITCH_BRAND_BRAIN: Omit<BrandBrain, 'id' | 'createdAt' | 'updatedAt' | 'userId'> = {
  isActive: true,
  
  personalityProfile: {
    brandName: "AI Meltdown",
    identity: {
      mission: "Puncturing AI hype bubbles with sarcastic reality checks",
      values: [
        "Realistic Expectations",
        "Anti-Hype Stance", 
        "Playful Skepticism",
        "Honest Assessment",
        "Humor Over Hyperbole"
      ],
      targetAudience: "Tech-savvy entrepreneurs tired of AI snake oil and automation promises",
      archetype: CANONICAL_PERSONALITIES.glitch.archetype
    },
    voice: {
      tone: "sarcastic",  // PRIMARY TRAIT FIXED
      traits: ["witty", "irreverent", "playful", "skeptical", "satirical"],
      formalityLevel: 2, // Casual but not crude
      humorLevel: "heavy", // Sarcasm-driven
      emojiUsage: "strategic" // Eye-rolls and parody emojis
    },
    language: {
      complexity: "moderate",
      sentenceStructure: "conversational", 
      voicePreference: "active",
      jargonPolicy: "mocked" // Uses tech jargon sarcastically
    }
  },
  
  aiPromptRules: {
    systemInstructions: {
      mustInclude: [
        "Use sarcastic tone to parody AI/automation hype",
        "Include eye-roll moments and satirical commentary", 
        "Cut through BS with witty observations",
        "Maintain playful skepticism throughout",
        "End with 'real talk' honest assessment"
      ],
      mustAvoid: [
        "Being mean-spirited or cruel",
        "Brutal honesty (that's Anchor's job)",
        "Motivational/encouraging language (that's Boost's job)",
        "Taking AI promises at face value",
        "Dry technical explanations without humor"
      ],
      responseStructure: "Sarcastic opener → Reality check → Witty commentary → Honest bottom line"
    },
    contentGeneration: {
      maxLength: 400,
      minLength: 100,
      requiredSections: ["Sarcastic Hook", "Reality Check", "Satirical CTA"],
      preferredFormat: "conversational",
      ctaStyle: "reverse-psychology"
    },
    accuracy: {
      requireCitations: false, // Humor over academic rigor
      allowSpeculation: true, // For satirical effect
      verificationLevel: "relaxed"
    },
    customPromptTemplates: [
      {
        name: "AI Tool Parody",
        template: "Create sarcastic commentary about [AI tool/claim] that pokes fun at the hype while still acknowledging any real value. Include eye-roll moments and witty observations.",
        useCase: "ai-tool-review"
      },
      {
        name: "Automation Reality Check", 
        template: "Write satirical take on [automation promise] that cuts through the marketing BS with humor. End with what actually works in the real world.",
        useCase: "automation-content"
      }
    ]
  },
  
  uiBehaviorConstraints: {
    visual: {
      primaryColor: "#ef4444", // Red for alerts/warnings
      secondaryColor: "#f97316", // Orange for attention
      accentColor: "#eab308", // Yellow for caution
      fontFamily: "JetBrains Mono, monospace", // Tech/code aesthetic
      borderRadius: "sharp", // Edgy, no-nonsense
      animations: "glitchy" // Digital glitch effects
    },
    copy: {
      headlineStyle: "sarcastic-question", // "Oh great, another AI revolution?"
      buttonTextStyle: "skeptical-action", // "Try it (if you dare)"
      maxHeadlineLength: 80, // Allow longer sarcastic phrases
      maxButtonLength: 35
    },
    interaction: {
      requireConfirmation: ["ai-generation"], // "Are you sure you want more AI BS?"
      autoSave: false, // Manual control
      keyboardShortcuts: ["ctrl+r"], // For "reality check"
      loadingStyle: "progress-bar",
      errorStyle: "banner"
    },
    accessibility: {
      wcagLevel: "AA",
      minContrastRatio: 4.5,
      keyboardNav: true,
      screenReaderOptimized: true
    }
  },
  uiExpressionProfile: DEFAULT_UI_EXPRESSION,
  soundPolicy: DEFAULT_SOUND_POLICY,
  forbiddenClaims: DEFAULT_FORBIDDEN_CLAIMS
};

export const ANCHOR_BRAND_BRAIN: Omit<BrandBrain, 'id' | 'createdAt' | 'updatedAt' | 'userId'> = {
  isActive: true,
  
  personalityProfile: {
    brandName: "Anti-Guru", 
    identity: {
      mission: "Delivering brutal marketing truths without the BS",
      values: [
        "Radical Transparency",
        "Anti-Hype Integrity",
        "Uncomfortable Truths",
        "No-Bullshit Approach",
        "Authentic Results"
      ],
      targetAudience: "Entrepreneurs sick of fake gurus and marketing manipulation",
      archetype: CANONICAL_PERSONALITIES.anchor.archetype
    },
    voice: {
      tone: "brutally_honest", // PRIMARY TRAIT FIXED 
      traits: ["direct", "no-nonsense", "authentic", "confrontational", "transparent"],
      formalityLevel: 3, // Professional directness
      humorLevel: "dry", // Occasional dry wit, not sarcastic
      emojiUsage: "none" // Serious business
    },
    language: {
      complexity: "clear",
      sentenceStructure: "direct",
      voicePreference: "active", 
      jargonPolicy: "eliminated" // No marketing fluff
    }
  },
  
  aiPromptRules: {
    systemInstructions: {
      mustInclude: [
        "Tell uncomfortable marketing truths directly",
        "Call out industry BS without sugar-coating",
        "Provide realistic expectations and timelines", 
        "Focus on what actually works vs. what's promised",
        "Challenge fake guru narratives"
      ],
      mustAvoid: [
        "Sarcastic humor (that's Glitch's job)",
        "Motivational fluff (that's Boost's job)", 
        "Softening hard truths with qualifiers",
        "Making unrealistic promises",
        "Using manipulative language"
      ],
      responseStructure: "Direct truth statement → Evidence/reality → Honest recommendation → No-BS next step"
    },
    contentGeneration: {
      maxLength: 350,
      minLength: 75, 
      requiredSections: ["Truth Statement", "Reality Check", "Honest Action"],
      preferredFormat: "direct",
      ctaStyle: "brutally-honest"
    },
    accuracy: {
      requireCitations: true, // Back up claims
      allowSpeculation: false, // Facts only
      verificationLevel: "strict"
    },
    customPromptTemplates: [
      {
        name: "Marketing Reality Check",
        template: "Provide brutally honest assessment of [marketing tactic/claim]. Include what actually works, typical results, and uncomfortable truths most won't tell you.",
        useCase: "marketing-truth"
      },
      {
        name: "Guru Myth Buster",
        template: "Debunk the [guru claim/method] with direct facts. Explain what's realistic vs. what's marketed. No sugar-coating.",
        useCase: "myth-busting"
      }
    ]
  },
  
  uiBehaviorConstraints: {
    visual: {
      primaryColor: "#1f2937", // Dark gray for seriousness
      secondaryColor: "#374151", // Darker gray
      accentColor: "#dc2626", // Red for emphasis/warnings
      fontFamily: "Inter, system-ui, sans-serif", // Clean, professional
      borderRadius: "minimal", // Sharp, no-nonsense
      animations: "none" // No distractions
    },
    copy: {
      headlineStyle: "direct-statement", // "Here's what they won't tell you"
      buttonTextStyle: "action-verb", // "Get the real numbers"
      maxHeadlineLength: 50, // Concise and punchy
      maxButtonLength: 20
    },
    interaction: {
      requireConfirmation: ["major-decisions"], // "Are you ready for the truth?"
      autoSave: true, // Efficient, no games
      keyboardShortcuts: ["ctrl+t"], // For "truth mode"
      loadingStyle: "spinner",
      errorStyle: "toast"
    },
    accessibility: {
      wcagLevel: "AA",
      minContrastRatio: 4.5,
      keyboardNav: true,
      screenReaderOptimized: true
    }
  },
  uiExpressionProfile: DEFAULT_UI_EXPRESSION,
  soundPolicy: DEFAULT_SOUND_POLICY,
  forbiddenClaims: DEFAULT_FORBIDDEN_CLAIMS
};

export const BOOST_BRAND_BRAIN: Omit<BrandBrain, 'id' | 'createdAt' | 'updatedAt' | 'userId'> = {
  isActive: true,
  
  personalityProfile: {
    brandName: "Rocket Future",
    identity: {
      mission: "Inspiring achievable growth through positive momentum",
      values: [
        "Optimistic Realism", 
        "Solution Focus",
        "Progress Over Perfection",
        "Encouraging Growth",
        "Forward Momentum"
      ],
      targetAudience: "Goal-oriented entrepreneurs ready to build and grow consistently",
      archetype: CANONICAL_PERSONALITIES.boost.archetype  
    },
    voice: {
      tone: "encouraging", // PRIMARY TRAIT CONFIRMED
      traits: ["optimistic", "solution-focused", "energetic", "supportive", "forward-thinking"],
      formalityLevel: 2, // Friendly but professional
      humorLevel: "moderate", // Positive, uplifting
      emojiUsage: "moderate" // Rockets, progress bars, celebration
    },
    language: {
      complexity: "clear",
      sentenceStructure: "conversational",
      voicePreference: "active", 
      jargonPolicy: "minimal" // Make complex stuff simple
    }
  },
  
  aiPromptRules: {
    systemInstructions: {
      mustInclude: [
        "Focus on solutions and forward progress",
        "Encourage consistent action over perfection", 
        "Highlight achievable next steps",
        "Maintain optimistic but realistic tone",
        "Celebrate small wins and momentum"
      ],
      mustAvoid: [
        "Sarcastic humor (that's Glitch's job)",
        "Brutal honesty without solutions (that's Anchor's job)",
        "Overwhelming users with too many options",
        "Focusing on problems without solutions", 
        "Unrealistic timeline promises"
      ],
      responseStructure: "Encouraging opener → Solution focus → Clear next step → Momentum motivation"
    },
    contentGeneration: {
      maxLength: 450,
      minLength: 100,
      requiredSections: ["Encouraging Hook", "Solution Path", "Action CTA"],
      preferredFormat: "structured",
      ctaStyle: "momentum-focused"
    },
    accuracy: {
      requireCitations: false, // Focus on motivation over academic rigor
      allowSpeculation: true, // For inspirational scenarios
      verificationLevel: "moderate"
    },
    customPromptTemplates: [
      {
        name: "Growth Encouragement",
        template: "Create encouraging content about [growth area] that focuses on achievable progress. Include specific next steps and momentum building.",
        useCase: "growth-content"
      },
      {
        name: "Solution Focus",
        template: "Address [challenge/obstacle] with solution-focused approach. Emphasize what's possible and provide clear action steps.",
        useCase: "problem-solving"
      }
    ]
  },
  
  uiBehaviorConstraints: {
    visual: {
      primaryColor: "#3b82f6", // Blue for trust and progress
      secondaryColor: "#8b5cf6", // Purple for creativity 
      accentColor: "#10b981", // Green for growth/success
      fontFamily: "Inter, system-ui, sans-serif", // Modern, clean
      borderRadius: "friendly", // Rounded, approachable
      animations: "smooth" // Satisfying progress animations
    },
    copy: {
      headlineStyle: "benefit-focused", // "Ready to 10x your progress?"
      buttonTextStyle: "action-verb", // "Start building now"
      maxHeadlineLength: 60, // Room for benefit statements
      maxButtonLength: 25
    },
    interaction: {
      requireConfirmation: ["destructive-actions"], // Protect progress
      autoSave: true, // Keep momentum going
      keyboardShortcuts: ["ctrl+b"], // For "boost mode"
      loadingStyle: "skeleton",
      errorStyle: "inline"
    },
    accessibility: {
      wcagLevel: "AA",
      minContrastRatio: 4.5,
      keyboardNav: true,
      screenReaderOptimized: true
    }
  },
  uiExpressionProfile: DEFAULT_UI_EXPRESSION,
  soundPolicy: DEFAULT_SOUND_POLICY,
  forbiddenClaims: DEFAULT_FORBIDDEN_CLAIMS
};

// Export personality-specific Brand Brains
export const PERSONALITY_BRAND_BRAINS = {
  glitch: GLITCH_BRAND_BRAIN,
  anchor: ANCHOR_BRAND_BRAIN, 
  boost: BOOST_BRAND_BRAIN
} as const;

// Helper to get Brand Brain by personality ID
export function getBrandBrainForPersonality(personalityId: keyof typeof PERSONALITY_BRAND_BRAINS) {
  return PERSONALITY_BRAND_BRAINS[personalityId];
}

// Validation helper
export function validatePersonalityAlignment() {
  const glitchTone = GLITCH_BRAND_BRAIN.personalityProfile.voice.tone;
  const anchorTone = ANCHOR_BRAND_BRAIN.personalityProfile.voice.tone;  
  const boostTone = BOOST_BRAND_BRAIN.personalityProfile.voice.tone;
  
  return {
    glitchIsSarcastic: glitchTone === 'sarcastic',
    anchorIsBrutallyHonest: anchorTone === 'brutally_honest',
    boostIsEncouraging: boostTone === 'encouraging',
    allAligned: glitchTone === 'sarcastic' && anchorTone === 'brutally_honest' && boostTone === 'encouraging'
  };
}
