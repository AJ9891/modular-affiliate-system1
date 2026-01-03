import { BrandBrain } from '@/types/brand-brain';

/**
 * Default BrandBrain configuration
 * This serves as a template and fallback when no custom brand is configured
 */
export const defaultBrandBrain: Omit<BrandBrain, 'id' | 'createdAt' | 'updatedAt' | 'userId'> = {
  isActive: true,
  
  personalityProfile: {
    brandName: "Your Brand",
    identity: {
      mission: "Empowering entrepreneurs to build successful affiliate marketing businesses",
      values: [
        "Transparency",
        "Innovation",
        "Customer Success",
        "Ethical Marketing",
        "Continuous Improvement"
      ],
      targetAudience: "Aspiring and established affiliate marketers, digital entrepreneurs, and online business owners",
      archetype: "The Sage"
    },
    voice: {
      tone: "professional",
      traits: ["helpful", "trustworthy", "innovative", "results-oriented", "educational"],
      formalityLevel: 3,
      humorLevel: "subtle",
      emojiUsage: "rare"
    },
    language: {
      complexity: "moderate",
      sentenceStructure: "varied",
      voicePreference: "active",
      jargonPolicy: "minimal"
    }
  },
  
  aiPromptRules: {
    systemInstructions: {
      mustInclude: [
        "Maintain professional and helpful tone",
        "Focus on actionable advice",
        "Provide specific examples when possible",
        "Always consider ethical marketing practices",
        "Respect user privacy and data"
      ],
      mustAvoid: [
        "Making unrealistic income promises",
        "Using manipulative language",
        "Sharing unverified statistics",
        "Recommending unethical tactics",
        "Guaranteeing specific results"
      ],
      responseStructure: "Start with context, provide clear steps or information, end with actionable next step"
    },
    contentGeneration: {
      maxLength: 500,
      minLength: 50,
      requiredSections: ["Introduction", "Main Content", "Call-to-Action"],
      preferredFormat: "mixed",
      ctaStyle: "benefit-focused"
    },
    accuracy: {
      requireCitations: true,
      allowSpeculation: false,
      verificationLevel: "strict"
    },
    customPromptTemplates: [
      {
        name: "Landing Page Copy",
        template: "Create compelling landing page copy that highlights benefits, addresses pain points, and includes a clear call-to-action. Focus on [topic] for [target audience].",
        useCase: "landing-page-generation"
      },
      {
        name: "Email Sequence",
        template: "Write an email for position [number] in a sequence about [topic]. Maintain continuity with previous emails while providing unique value.",
        useCase: "email-generation"
      }
    ]
  },
  
  uiBehaviorConstraints: {
    visual: {
      primaryColor: "#3b82f6",
      secondaryColor: "#8b5cf6",
      accentColor: "#10b981",
      fontFamily: "Inter, system-ui, sans-serif",
      borderRadius: "subtle",
      animations: "subtle"
    },
    copy: {
      headlineStyle: "benefit-driven",
      buttonTextStyle: "action-verb",
      maxHeadlineLength: 60,
      maxButtonLength: 25
    },
    interaction: {
      requireConfirmation: ["delete", "publish", "major-change"],
      autoSave: true,
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
  
  uiExpressionProfile: {
    hero: {
      variants: ['rocket'],
      motionIntensity: 'medium',
      visualNoise: 'controlled'
    },
    typography: {
      tone: 'confident',
      emphasisStyle: 'underline'
    },
    surfaces: {
      depth: 'soft',
      borderStyle: 'rounded'
    },
    microInteractions: {
      hoverAllowed: true,
      glitchAllowed: false,
      pulseAllowed: true
    },
    sound: {
      ambientProfiles: ['checklist'],
      maxVolume: 0.3
    }
  },
  
  soundPolicy: {
    voiceCharacteristics: {
      shouldBe: [
        "Clear and concise",
        "Helpful and supportive",
        "Professional yet approachable",
        "Trustworthy and authentic",
        "Results-oriented"
      ],
      shouldNotBe: [
        "Overly salesy or pushy",
        "Vague or ambiguous",
        "Condescending or pretentious",
        "Boring or generic",
        "Manipulative or deceptive"
      ]
    },
    wordChoice: {
      preferred: [
        "proven strategies",
        "real results",
        "actionable insights",
        "comprehensive solution",
        "transparent approach"
      ],
      avoid: [
        "get rich quick",
        "guaranteed income",
        "secret formula",
        "magic bullet",
        "overnight success"
      ],
      inclusivityRules: [
        "Use gender-neutral language",
        "Avoid ableist terms",
        "Be culturally sensitive",
        "Don't assume technical knowledge",
        "Welcome all experience levels"
      ]
    },
    messaging: {
      problemSolutionFraming: true,
      benefitFocused: true,
      socialProofStyle: "mixed",
      urgencyPolicy: "subtle"
    },
    customerCommunication: {
      addressStyle: "friendly",
      empathyLevel: "high",
      responseTimePromise: "We aim to respond within 24 hours"
    }
  },
  
  forbiddenClaims: {
    legal: {
      healthClaims: [
        "cure any disease",
        "guaranteed weight loss",
        "FDA-approved (unless actually true)",
        "medical advice"
      ],
      financialGuarantees: [
        "guaranteed income",
        "specific earnings promises",
        "no risk involved",
        "get rich quick"
      ],
      absoluteStatements: [
        "the only solution",
        "works 100% of the time",
        "never fails",
        "everyone succeeds"
      ],
      competitorMentions: "factual-only"
    },
    regulatory: {
      ftcDisclosures: [
        "Affiliate links must be disclosed",
        "Sponsored content must be labeled",
        "Results not typical disclaimers required",
        "Material connections must be disclosed"
      ],
      gdprCompliance: [
        "Obtain explicit consent for data collection",
        "Provide clear privacy policy",
        "Allow data deletion requests",
        "Secure data storage and transmission"
      ],
      industryRegulations: [
        "Follow CAN-SPAM for email marketing",
        "Comply with platform-specific advertising policies",
        "Adhere to payment processor terms of service"
      ]
    },
    ethics: {
      exploitativeClaims: [
        "Targeting vulnerable populations unfairly",
        "Using fear without providing real solutions",
        "Creating false urgency or scarcity",
        "Hiding important information in fine print"
      ],
      fearMongeringLimits: [
        "Don't exaggerate problems to sell solutions",
        "Avoid creating unnecessary anxiety",
        "Balance problem awareness with empowerment"
      ],
      transparencyRules: [
        "Be honest about affiliate relationships",
        "Clearly state refund and cancellation policies",
        "Disclose all costs upfront",
        "Be truthful about product capabilities"
      ]
    },
    contentRestrictions: {
      prohibitedTopics: [
        "Illegal activities",
        "Adult content (explicit)",
        "Weapons and ammunition",
        "Gambling (where restricted)"
      ],
      sensitiveTopics: [
        "Political content",
        "Religious content",
        "Medical advice",
        "Legal advice",
        "Financial advice"
      ],
      ageRestrictions: "Content appropriate for users 18+"
    }
  },
  
  metadata: {
    version: "1.0.0",
    notes: "Default brand configuration"
  }
};
