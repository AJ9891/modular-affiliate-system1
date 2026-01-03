/**
 * useUIExpression Hook
 * 
 * Returns the active UI expression profile based on the current brand mode.
 * This is the primary way components should access UI expression rules.
 * 
 * Usage:
 * ```tsx
 * const ui = useUIExpression();
 * const heroRules = ui.hero;
 * const canUseRocket = heroRules.variants.includes('rocket');
 * ```
 */

'use client';

import { useMemo } from 'react';
import { useBrandBrain } from '@/hooks/useBrandBrain';
import { UI_PROFILES, getUIProfile } from './ui-profiles';
import { UIExpressionProfile } from '@/types/ui-expression';

export function useUIExpression(): UIExpressionProfile {
  const { activeProfile } = useBrandBrain();

  const uiProfile = useMemo(() => {
    // If no active profile, use anti_guru as default
    if (!activeProfile) {
      return UI_PROFILES.anti_guru;
    }

    // Check if custom ui_expression_profile exists
    if (activeProfile.ui_expression_profile) {
      // Merge custom profile with defaults
      const brandMode = activeProfile.brand_mode || 'anti_guru';
      const defaultProfile = UI_PROFILES[brandMode] || UI_PROFILES.anti_guru;
      
      return {
        hero: {
          ...defaultProfile.hero,
          ...(activeProfile.ui_expression_profile.hero || {})
        },
        typography: {
          ...defaultProfile.typography,
          ...(activeProfile.ui_expression_profile.typography || {})
        },
        surfaces: {
          ...defaultProfile.surfaces,
          ...(activeProfile.ui_expression_profile.surfaces || {})
        },
        microInteractions: {
          ...defaultProfile.microInteractions,
          ...(activeProfile.ui_expression_profile.microInteractions || {})
        },
        sound: {
          ...defaultProfile.sound,
          ...(activeProfile.ui_expression_profile.sound || {})
        }
      };
    }

    // Fall back to brand mode profile
    const brandMode = activeProfile.brand_mode || 'anti_guru';
    return getUIProfile(brandMode);
  }, [activeProfile]);

  return uiProfile;
}
