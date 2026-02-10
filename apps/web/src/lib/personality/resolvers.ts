/**
 * Visual Behavior Helpers
 * 
 * Components ask: "How should I behave right now?"
 * These resolvers answer with TASTEFUL, PERIPHERAL expressions.
 * 
 * Key rule: Felt more than noticed.
 * 
 * Usage:
 * ```tsx
 * const { personality } = usePersonality();
 * const context = getPersonalityContext(pathname);
 * const visual = resolveVisualTokens(personality, context.visualWeight);
 * const motion = resolveMotionTokens(personality, context.motionAllowed);
 * 
 * <motion.div className={visual.spacing} {...motion.enter}>
 *   {children}
 * </motion.div>
 * ```
 */

import type { PersonalityProfile, PersonalityContext } from './types';

/**
 * Get Personality Context from Route
 * 
 * This determines how much personality should express itself based on WHERE the user is.
 * Context modulates personality, it doesn't replace it.
 * 
 * Rules:
 * 1. Launchpad: Sacred rocket zone 🚀 (only hard override)
 * 2. Builder: User-controlled, expressive but focused
 * 3. Dashboard/Admin/Settings: Calm, respectful, tool mode
 * 4. Marketing/Read-only: Tasteful flair
 */
export function getPersonalityContext(pathname: string): PersonalityContext {
  // 1. Launchpad onboarding (special, sacred rocket zone 🚀)
  // This is the ONLY hard override — justified by narrative, not convenience
  if (pathname.startsWith('/launchpad')) {
    return {
      visualWeight: 'high',
      motionAllowed: true,
      soundAllowed: true,
      forceBrandMode: 'rocket_future'
    };
  }
  
  // 2. Funnel Builder (user-controlled, expressive)
  // Personality should be felt but not interfere with precision work
  if (pathname.startsWith('/builder')) {
    return {
      visualWeight: 'medium',
      motionAllowed: true,
      soundAllowed: false // Sound would be distracting here
    };
  }
  
  // 3. Dashboard / Admin / Settings (calm, respectful)
  // "We're in tool mode. Don't perform."
  if (pathname.startsWith('/dashboard') || 
      pathname.startsWith('/admin') ||
      pathname.startsWith('/settings') ||
      pathname.startsWith('/analytics')) {
    return {
      visualWeight: 'low',
      motionAllowed: false,
      soundAllowed: false
    };
  }
  
  // 4. Marketing / Read-only pages (tasteful flair)
  // This is where Anti-Guru restraint really shines
  return {
    visualWeight: 'medium',
    motionAllowed: true,
    soundAllowed: false
  };
}

/**
 * Visual Tokens: Concrete decisions from behavioral primitives
 * 
 * These are NOT themes. They're behavior translations.
 */
export interface VisualTokens {
  // Spacing (from spatialRhythm)
  spacing: {
    section: string;      // Between major sections
    content: string;      // Between content blocks
    inline: string;       // Between inline elements
  };
  
  // Borders (from contrastBias + ornamentLevel)
  borders: {
    radius: string;       // Border radius
    width: string;        // Border thickness
    style: string;        // Border visual style
  };
  
  // Depth (from ornamentLevel)
  depth: {
    card: string;         // Card shadow
    hover: string;        // Hover state shadow
    focus: string;        // Focus ring
  };
  
  // Effects (from ornamentLevel)
  effects: {
    backdrop: string;     // Backdrop blur
    gradient: boolean;    // Allow gradients?
    glow: boolean;        // Allow glows?
  };
}

/**
 * Motion Tokens: Animation decisions from behavioral primitives
 */
export interface MotionTokens {
  // Timing (from motionProfile + animationBudget)
  timing: {
    duration: number;     // Base duration in ms
    easing: string;       // CSS easing function
    delay: number;        // Stagger delay
  };
  
  // Presets for common animations
  enter: {
    initial: object;
    animate: object;
    exit?: object;
    transition: object;
  };
  
  hover: {
    scale: number;
    y: number;
    transition: object;
  };
  
  // Budget constraints
  allowStagger: boolean;
  allowPageTransitions: boolean;
  allowMicroInteractions: boolean;
}

/**
 * Resolve Visual Tokens from Personality
 * NOW RESPECTS VISUAL WEIGHT from context
 * 
 * visualWeight controls how much personality shows:
 * - none: Zero decoration, flat, instant
 * - low: Minimal hints, subtle only
 * - medium: Balanced expression
 * - high: Full personality range
 */
export function resolveVisualTokens(
  personality: PersonalityProfile,
  visualWeight: 'none' | 'low' | 'medium' | 'high' = 'medium'
): VisualTokens {
  const { spatialRhythm, contrastBias, ornamentLevel } = personality.visuals;
  
  // OVERRIDE: If visualWeight is 'none', force flat appearance
  if (visualWeight === 'none') {
    return {
      spacing: { section: 'space-y-8', content: 'space-y-4', inline: 'gap-3' },
      borders: { radius: 'rounded-none', width: 'border', style: 'border-gray-300' },
      depth: { card: 'shadow-none', hover: '', focus: 'focus:ring-2 focus:ring-gray-900' },
      effects: { backdrop: 'backdrop-blur-none', gradient: false, glow: false }
    };
  }
  
  // Spacing: How much breathing room
  const spacing = {
    generous: { section: 'space-y-16', content: 'space-y-8', inline: 'gap-6' },
    standard: { section: 'space-y-12', content: 'space-y-6', inline: 'gap-4' },
    compressed: { section: 'space-y-8', content: 'space-y-4', inline: 'gap-2' },
    edgy: { section: 'space-y-10', content: 'space-y-5', inline: 'gap-3' },
    flowing: { section: 'space-y-14', content: 'space-y-7', inline: 'gap-5' }
  }[spatialRhythm] ?? { section: 'space-y-12', content: 'space-y-6', inline: 'gap-4' };
  
  // Borders: From contrast + ornament, scaled by visualWeight
  const borders = (() => {
    if (visualWeight === 'low' || ornamentLevel === 'none') {
      return { radius: 'rounded-none', width: 'border', style: 'border-gray-300' };
    }
    if (ornamentLevel === 'light') {
      return { radius: 'rounded-lg', width: 'border', style: 'border-gray-200' };
    }
    return contrastBias === 'broken'
      ? { radius: 'rounded-sm', width: 'border-2', style: 'border-gray-400' }
      : { radius: 'rounded-md', width: 'border', style: 'border-gray-300' };
  })();
  
  // Depth: Scaled by visualWeight
  const depth = (() => {
    if (visualWeight === 'low') {
      return {
        card: 'shadow-none',
        hover: '',
        focus: 'focus:ring-1 focus:ring-gray-400'
      };
    }
    
    const baseDepth = {
      none: { card: 'shadow-none', hover: 'hover:shadow-sm', focus: 'focus:ring-2 focus:ring-gray-900' },
      light: { card: 'shadow-sm', hover: 'hover:shadow-md', focus: 'focus:ring-2 focus:ring-blue-500' },
      expressive: { card: 'shadow-md', hover: 'hover:shadow-lg', focus: 'focus:ring-2 focus:ring-purple-500' },
      satirical: { card: 'shadow-md', hover: 'hover:shadow-lg', focus: 'focus:ring-2 focus:ring-purple-500' },
      uplifting: { card: 'shadow-sm', hover: 'hover:shadow-md', focus: 'focus:ring-2 focus:ring-green-500' }
    }[ornamentLevel] ?? { card: 'shadow-sm', hover: 'hover:shadow-md', focus: 'focus:ring-2 focus:ring-blue-500' };
    
    // High visualWeight = allow full depth
    if (visualWeight === 'high') return baseDepth;
    
    // Medium = reduce by one step
    return {
      card: ornamentLevel === 'none' ? 'shadow-none' : 'shadow-sm',
      hover: ornamentLevel === 'expressive' ? 'hover:shadow-md' : 'hover:shadow-sm',
      focus: baseDepth.focus
    };
  })();
  
  // Effects: Only at medium/high weight
  const effects = visualWeight === 'high' ? ({
    none: { backdrop: 'backdrop-blur-none', gradient: false, glow: false },
    light: { backdrop: 'backdrop-blur-sm', gradient: true, glow: true },
    expressive: { backdrop: 'backdrop-blur-md', gradient: false, glow: false },
    satirical: { backdrop: 'backdrop-blur-md', gradient: true, glow: true },
    uplifting: { backdrop: 'backdrop-blur-sm', gradient: true, glow: true }
  }[ornamentLevel] ?? { backdrop: 'backdrop-blur-none', gradient: false, glow: false }) : {
    backdrop: 'backdrop-blur-none',
    gradient: false,
    glow: false
  };
  
  return { spacing, borders, depth, effects };
}

/**
 * Resolve Motion Tokens from Personality
 * NOW RESPECTS motionAllowed flag from context
 * 
 * ROCKET FUTURE: Smooth ease-out, feels like progress
 * ANTI-GURU: Almost none, instant when needed
 * AI MELTDOWN: Micro-glitches on hover only, settles quickly
 */
export function resolveMotionTokens(
  personality: PersonalityProfile,
  motionAllowed: boolean = true
): MotionTokens {
  const { motionProfile, animationBudget } = personality.visuals;
  
  // OVERRIDE: If motion not allowed, return zero animation
  if (!motionAllowed || animationBudget === 'zero') {
    return {
      timing: { duration: 0, easing: 'linear', delay: 0 },
      enter: {
        initial: {},
        animate: {},
        transition: { duration: 0 }
      },
      hover: { scale: 1, y: 0, transition: { duration: 0 } },
      allowStagger: false,
      allowPageTransitions: false,
      allowMicroInteractions: false
    };
  }
  
  // Calm = Rocket Future: Smooth, predictable, ease-out
  if (motionProfile === 'calm') {
    return {
      timing: { 
        duration: animationBudget === 'micro-only' ? 150 : 200,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)', // ease-out
        delay: 50
      },
      enter: {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
      },
      hover: {
        scale: 1.01,
        y: -1,
        transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] }
      },
      allowStagger: animationBudget === 'low',
      allowPageTransitions: animationBudget === 'low',
      allowMicroInteractions: true
    };
  }
  
  // Flat = Anti-Guru: Minimal, almost nothing
  if (motionProfile === 'flat') {
    return {
      timing: { duration: 100, easing: 'linear', delay: 0 },
      enter: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.1 }
      },
      hover: { scale: 1, y: 0, transition: { duration: 0 } },
      allowStagger: false,
      allowPageTransitions: false,
      allowMicroInteractions: animationBudget === 'micro-only'
    };
  }
  
  // Unstable = AI Meltdown: Micro-glitch, then settle
  // CRITICAL: Only on hover, very restrained
  return {
    timing: { duration: 120, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', delay: 0 },
    enter: {
      initial: { opacity: 0, x: -2, y: 1 },
      animate: { opacity: 1, x: 0, y: 0 },
      transition: { 
        duration: 0.18,
        ease: [0.68, -0.55, 0.265, 1.55]
      }
    },
    hover: {
      scale: 1.005,
      y: -0.5,
      transition: { 
        duration: 0.12,
        ease: [0.68, -0.55, 0.265, 1.55],
        // Slight jitter on hover only
        repeat: 1,
        repeatType: 'reverse' as const
      }
    },
    allowStagger: false,
    allowPageTransitions: false,
    allowMicroInteractions: true
  };
}

/**
 * Resolve Sound Profile from Personality + Context
 * NOW RESPECTS soundAllowed flag from context
 */
export function resolveSoundProfile(
  personality: PersonalityProfile,
  soundAllowed: boolean = false
) {
  // OVERRIDE: If sound not allowed, return disabled config
  if (!soundAllowed) {
    return {
      enabled: false,
      profile: null,
      volume: 0
    };
  }
  
  const soundProfile = personality.soundProfile;
  
  return {
    enabled: soundProfile !== 'none',
    profile: soundProfile,
    volume: {
      none: 0,
      ambient_checklist: 0.3,
      glitch_comm: 0.5,
      procedural_hum: 0.2
    }[soundProfile],
    
    // Event-to-sound mappings
    events: {
      click: soundProfile === 'ambient_checklist' ? 'click.wav' : null,
      success: soundProfile === 'ambient_checklist' ? 'success.wav' : null,
      error: soundProfile === 'glitch_comm' ? 'glitch_error.wav' : null,
      ambient: soundProfile === 'procedural_hum' ? 'ambient_hum.wav' : null
    }
  };
}

/**
 * Personality-Appropriate Icons
 * 
 * Different personalities prefer different icon styles
 */
export function resolveIconStyle(personality: PersonalityProfile): {
  strokeWidth: number;
  style: 'outline' | 'solid' | 'duotone';
  animateOnHover: boolean;
} {
  const { ornamentLevel, motionProfile } = personality.visuals;
  
  // Anti-Guru: Simple outlines, no animation
  if (ornamentLevel === 'none') {
    return {
      strokeWidth: 1.5,
      style: 'outline',
      animateOnHover: false
    };
  }
  
  // Rocket Future: Slightly thicker, subtle animation
  if (ornamentLevel === 'light') {
    return {
      strokeWidth: 2,
      style: 'outline',
      animateOnHover: true
    };
  }
  
  // AI Meltdown: Duotone, jittery on hover
  return {
    strokeWidth: 1.5,
    style: 'duotone',
    animateOnHover: motionProfile === 'unstable'
  };
}

// Legacy exports for backward compatibility
export function resolveVisualProfile(personality: PersonalityProfile) {
  return resolveVisualTokens(personality);
}

export function resolveMotionProfile(personality: PersonalityProfile) {
  return resolveMotionTokens(personality);
}

export function resolveToneProfile(personality: PersonalityProfile) {
  const authorityTone = personality.authorityTone;
  
  const profiles = {
    calm: {
      headingSizes: {
        h1: 'text-3xl md:text-4xl',
        h2: 'text-2xl md:text-3xl',
        h3: 'text-xl md:text-2xl',
        h4: 'text-lg md:text-xl'
      },
      headingWeight: 'font-semibold',
      bodyWeight: 'font-normal',
      headingLeading: 'leading-normal',
      bodyLeading: 'leading-relaxed',
      uppercase: false,
      italic: false,
      letterSpacing: 'tracking-normal'
    },
    blunt: {
      headingSizes: {
        h1: 'text-4xl md:text-5xl',
        h2: 'text-3xl md:text-4xl',
        h3: 'text-2xl md:text-3xl',
        h4: 'text-xl md:text-2xl'
      },
      headingWeight: 'font-bold',
      bodyWeight: 'font-medium',
      headingLeading: 'leading-tight',
      bodyLeading: 'leading-normal',
      uppercase: false,
      italic: false,
      letterSpacing: 'tracking-tight'
    },
    unraveling: {
      headingSizes: {
        h1: 'text-3xl md:text-6xl',
        h2: 'text-2xl md:text-5xl',
        h3: 'text-xl md:text-3xl',
        h4: 'text-lg md:text-2xl'
      },
      headingWeight: 'font-black',
      bodyWeight: 'font-normal',
      headingLeading: 'leading-tight',
      bodyLeading: 'leading-snug',
      uppercase: true,
      italic: false,
      letterSpacing: 'tracking-wider'
    },
    sarcastic: {
      headingSizes: {
        h1: 'text-4xl md:text-5xl',
        h2: 'text-3xl md:text-4xl',
        h3: 'text-2xl md:text-3xl',
        h4: 'text-xl md:text-2xl'
      },
      headingWeight: 'font-semibold',
      bodyWeight: 'font-normal',
      headingLeading: 'leading-tight',
      bodyLeading: 'leading-relaxed',
      uppercase: false,
      italic: false,
      letterSpacing: 'tracking-normal'
    },
    brutally_honest: {
      headingSizes: {
        h1: 'text-4xl md:text-5xl',
        h2: 'text-3xl md:text-4xl',
        h3: 'text-2xl md:text-3xl',
        h4: 'text-xl md:text-2xl'
      },
      headingWeight: 'font-bold',
      bodyWeight: 'font-medium',
      headingLeading: 'leading-tight',
      bodyLeading: 'leading-normal',
      uppercase: false,
      italic: false,
      letterSpacing: 'tracking-tight'
    },
    encouraging: {
      headingSizes: {
        h1: 'text-4xl md:text-5xl',
        h2: 'text-3xl md:text-4xl',
        h3: 'text-2xl md:text-3xl',
        h4: 'text-xl md:text-2xl'
      },
      headingWeight: 'font-semibold',
      bodyWeight: 'font-normal',
      headingLeading: 'leading-snug',
      bodyLeading: 'leading-relaxed',
      uppercase: false,
      italic: false,
      letterSpacing: 'tracking-normal'
    }
  };
  
  return profiles[authorityTone];
}
