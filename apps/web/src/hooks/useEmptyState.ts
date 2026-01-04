/**
 * Empty State Hook
 * 
 * Wire empty states to personality system
 * Returns both contract and visuals for rendering
 */

'use client'

import { resolvePersonality } from '@/lib/personality'
import { 
  EmptyStateContract, 
  EmptyStateCategory,
  EmptyStateSeverity 
} from '@/lib/empty-states/types'
import { 
  resolveEmptyStateTone,
  resolveEmptyStateVisuals,
  getEmptyStateCopyTemplate 
} from '@/lib/empty-states/emptyStateResolver'

interface UseEmptyStateOptions {
  category: EmptyStateCategory
  severity: EmptyStateSeverity
  headline?: string
  body?: string
  primaryAction?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  brandMode?: 'ai_meltdown' | 'anti_guru' | 'rocket_future'
}

export function useEmptyState(options: UseEmptyStateOptions) {
  // Use provided brand mode or default to anti_guru (safest fallback)
  const personality = resolvePersonality(options.brandMode || 'anti_guru')
  
  // Resolve tone from personality + category
  const tone = resolveEmptyStateTone(personality, options.category)
  
  // Resolve visual expression
  const visuals = resolveEmptyStateVisuals(personality, options.category)
  
  // Get default copy if not provided
  const template = getEmptyStateCopyTemplate(tone, options.category)
  
  // Build contract
  const contract: EmptyStateContract = {
    tone,
    severity: options.severity,
    category: options.category,
    headline: options.headline || template.headline,
    body: options.body || template.body,
    primaryAction: options.primaryAction,
    secondaryAction: options.secondaryAction
  }
  
  return {
    contract,
    visuals,
    tone,
    personality
  }
}
