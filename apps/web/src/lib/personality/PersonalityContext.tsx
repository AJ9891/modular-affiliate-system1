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
import type { PersonalityProfile, BrandMode } from './types';
import { resolvePersonality } from './resolvePersonality';
import { getRoutePersonality } from './routePersonality';

/**
 * Context value shape
 */
interface PersonalityContextValue {
  personality: PersonalityProfile;
  brandMode: BrandMode;
  isRouteOverride: boolean;
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
  
  // Determine effective brand mode
  const effectiveBrandMode = useMemo(() => {
    if (enableRouteOverrides && pathname) {
      return getRoutePersonality(pathname, brandMode);
    }
    return brandMode;
  }, [pathname, brandMode, enableRouteOverrides]);
  
  // Check if using route override
  const isRouteOverride = useMemo(() => {
    if (!enableRouteOverrides || !pathname) return false;
    return getRoutePersonality(pathname, brandMode) !== (brandMode || 'anti_guru');
  }, [pathname, brandMode, enableRouteOverrides]);
  
  // Resolve personality once, memoize it
  const personality = useMemo(
    () => resolvePersonality(effectiveBrandMode),
    [effectiveBrandMode]
  );

  const value = useMemo(
    () => ({
      personality,
      brandMode: personality.mode,
      isRouteOverride
    }),
    [personality, isRouteOverride]
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
