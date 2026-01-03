/**
 * Personality Context
 * 
 * Provides personality to the entire app.
 * Resolve once at root, consume anywhere.
 * 
 * This prevents:
 * - Random components inventing tone
 * - Marketing pages drifting off-brand
 * - AI saying one thing while UI says another
 */

'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import type { PersonalityProfile, BrandMode, PersonalityContext as PersonalityContextType } from './types';
import { resolvePersonality } from './resolvePersonality';
import { getRoutePersonality } from './routePersonality';
import { getPersonalityContext } from './resolvers';

/**
 * Context value shape
 */
interface PersonalityContextValue {
  personality: PersonalityProfile;
  brandMode: BrandMode;
  isRouteOverride: boolean;
  context: PersonalityContextType; // NEW: Route-based context
}

/**
 * The React Context
 */
const PersonalityContext = createContext<PersonalityContextValue | null>(null);

/**
 * Provider Props
 */
interface PersonalityProviderProps {
  children: React.ReactNode;
  brandMode?: BrandMode | null;
  enableRouteOverrides?: boolean; // Default: false
}

/**
 * PersonalityProvider
 * 
 * Usage:
 * ```tsx
 * // In app layout or root
 * <PersonalityProvider brandMode={user?.brand_mode}>
 *   <App />
 * </PersonalityProvider>
 * 
 * // With route overrides (use sparingly)
 * <PersonalityProvider brandMode={user?.brand_mode} enableRouteOverrides>
 *   <App />
 * </PersonalityProvider>
 * ```
 */
export function PersonalityProvider({ 
  children, 
  brandMode,
  enableRouteOverrides = false
}: PersonalityProviderProps) {
  const pathname = usePathname();
  
  // Get route-based context (NEW: controls visual weight, motion, sound)
  const routeContext = useMemo(() => {
    return getPersonalityContext(pathname || '/');
  }, [pathname]);
  
  // Determine effective brand mode
  // Priority: 1. Route context forceBrandMode, 2. Route override, 3. User preference
  const effectiveBrandMode = useMemo(() => {
    // Launchpad gets hard override to rocket_future
    if (routeContext.forceBrandMode) {
      return routeContext.forceBrandMode;
    }
    
    if (enableRouteOverrides && pathname) {
      return getRoutePersonality(pathname, brandMode);
    }
    return brandMode;
  }, [pathname, brandMode, enableRouteOverrides, routeContext]);
  
  // Check if using route override
  const isRouteOverride = useMemo(() => {
    if (routeContext.forceBrandMode) return true;
    if (!enableRouteOverrides || !pathname) return false;
    return getRoutePersonality(pathname, brandMode) !== (brandMode || 'anti_guru');
  }, [pathname, brandMode, enableRouteOverrides, routeContext]);
  
  // Resolve personality once, memoize it
  const personality = useMemo(
    () => resolvePersonality(effectiveBrandMode),
    [effectiveBrandMode]
  );

  const value = useMemo(
    () => ({
      personality,
      brandMode: personality.mode,
      isRouteOverride,
      context: routeContext // NEW: Provide context for visual/motion/sound modulation
    }),
    [personality, isRouteOverride, routeContext]
  );

  return (
    <PersonalityContext.Provider value={value}>
      {children}
    </PersonalityContext.Provider>
  );
}

/**
 * usePersonality Hook
 * 
 * Access personality anywhere in the component tree.
 * 
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const { personality } = usePersonality();
 *   
 *   const buttonText = personality.contentGeneration.callToActionStyle === 'urgent'
 *     ? 'ACT NOW'
 *     : 'Get Started';
 *   
 *   return <button>{buttonText}</button>;
 * }
 * ```
 */
export function usePersonality(): PersonalityContextValue {
  const context = useContext(PersonalityContext);
  
  if (!context) {
    throw new Error(
      'usePersonality must be used within a PersonalityProvider. ' +
      'Wrap your app with <PersonalityProvider>.'
    );
  }
  
  return context;
}

/**
 * withPersonality HOC
 * 
 * For class components or when you need to inject personality as props.
 * 
 * Usage:
 * ```tsx
 * const EnhancedComponent = withPersonality(MyComponent);
 * ```
 */
export function withPersonality<P extends object>(
  Component: React.ComponentType<P & PersonalityContextValue>
) {
  return function WithPersonalityComponent(props: P) {
    const personality = usePersonality();
    return <Component {...props} {...personality} />;
  };
}

/**
 * Hook: usePersonalityMotion
 * 
 * Get motion configuration based on personality
 * Returns animation variants that respect motionStyle
 */
export function usePersonalityMotion() {
  const { personality } = usePersonality();
  
  const motionConfig = useMemo(() => {
    switch (personality.motionStyle) {
      case 'minimal':
        return {
          enabled: true,
          duration: 0.2,
          scale: 1.02
        };
      
      case 'procedural':
        return {
          enabled: true,
          duration: 0.6,
          scale: 1.1
        };
      
      case 'unstable':
        return {
          enabled: true,
          duration: 0.1,
          scale: Math.random() * 0.2 + 0.9 // Random between 0.9-1.1
        };
      
      default:
        return {
          enabled: true,
          duration: 0.3,
          scale: 1.05
        };
    }
  }, [personality.motionStyle]);
  
  return motionConfig;
}

/**
 * Hook: usePersonalitySound
 * 
 * Get sound configuration based on personality
 * Returns whether sounds should play and what type
 */
export function usePersonalitySound() {
  const { personality } = usePersonality();
  
  const soundConfig = useMemo(() => {
    switch (personality.soundProfile) {
      case 'none':
        return {
          enabled: false,
          profile: null
        };
      
      case 'ambient_checklist':
        return {
          enabled: true,
          profile: 'checklist' as const
        };
      
      case 'glitch_comm':
        return {
          enabled: true,
          profile: 'glitch' as const
        };
      
      case 'procedural_hum':
        return {
          enabled: true,
          profile: 'hum' as const
        };
      
      default:
        return {
          enabled: false,
          profile: null
        };
    }
  }, [personality.soundProfile]);
  
  return soundConfig;
}

/**
 * Hook: usePersonalityValidation
 * 
 * Validate content against personality rules
 * Useful for forms, content editors, AI generation
 */
export function usePersonalityValidation() {
  const { personality } = usePersonality();
  
  return useMemo(() => ({
    validate: (content: string) => {
      const violations: string[] = [];
      const lowerContent = content.toLowerCase();
      
      // Check forbidden phrases (if vocabulary rules exist)
      if (personality.vocabulary) {
        for (const phrase of personality.vocabulary.forbiddenPhrases) {
          if (lowerContent.includes(phrase.toLowerCase())) {
            violations.push(`Avoid using "${phrase}"`);
          }
        }
      
        // Check emoji usage
        const hasEmojis = /\p{Emoji}/u.test(content);
        if (hasEmojis && !personality.vocabulary.allowEmojis) {
          violations.push('Emojis are not allowed in this personality mode');
        }
      }
      
      return {
        isValid: violations.length === 0,
        violations
      };
    },
    
    getSuggestions: () => {
      return personality.vocabulary?.preferredPhrases || [];
    }
  }), [personality]);
}

/**
 * Hook: usePersonalityExpression
 * 
 * Get context-aware visual and motion tokens.
 * This respects route-based modulation (visual weight, motion allowed, sound allowed).
 * 
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const { visual, motion, sound } = usePersonalityExpression();
 *   
 *   return (
 *     <motion.div 
 *       className={visual.spacing.content}
 *       {...motion.enter}
 *     >
 *       <Card className={visual.borders.radius}>
 *         {content}
 *       </Card>
 *     </motion.div>
 *   );
 * }
 * ```
 */
export function usePersonalityExpression() {
  const { personality, context } = usePersonality();
  
  // Lazy import resolvers to avoid circular dependencies
  const { resolveVisualTokens, resolveMotionTokens, resolveSoundProfile } = require('./resolvers');
  
  const visual = useMemo(
    () => resolveVisualTokens(personality, context.visualWeight),
    [personality, context.visualWeight]
  );
  
  const motion = useMemo(
    () => resolveMotionTokens(personality, context.motionAllowed),
    [personality, context.motionAllowed]
  );
  
  const sound = useMemo(
    () => resolveSoundProfile(personality, context.soundAllowed),
    [personality, context.soundAllowed]
  );
  
  return { visual, motion, sound, context };
}
