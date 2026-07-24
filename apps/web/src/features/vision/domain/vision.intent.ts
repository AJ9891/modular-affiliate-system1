import type { VisionActionId, VisionIntent } from './vision.types'

const INTENTS: Array<{ intent: VisionIntent; actionId: VisionActionId; terms: string[] }> = [
  { intent: 'optimize', actionId: 'optimize-funnel', terms: ['optimize', 'conversion', 'a/b', 'ab test'] },
  { intent: 'analytics', actionId: 'view-analytics', terms: ['analytics', 'metric', 'traffic', 'radar'] },
  { intent: 'offers', actionId: 'manage-offers', terms: ['affiliate', 'commission', 'payout', 'offer'] },
  { intent: 'email', actionId: 'configure-email', terms: ['email', 'sequence', 'automation'] },
  { intent: 'admin', actionId: 'open-admin', terms: ['admin', 'users', 'roles', 'logs'] },
  { intent: 'build', actionId: 'build-funnel', terms: ['build', 'funnel', 'page', 'copy', 'headline'] },
]

export function resolveVisionIntent(prompt: string): { intent: VisionIntent; actionId?: VisionActionId; confidence: number } {
  const normalized = prompt.toLowerCase()
  if (/where should i start|what should i do|next (?:step|action)/.test(normalized)) {
    return { intent: 'next-best-action', confidence: 0.95 }
  }
  for (const candidate of INTENTS) {
    if (candidate.terms.some((term) => normalized.includes(term))) {
      return { intent: candidate.intent, actionId: candidate.actionId, confidence: 0.9 }
    }
  }
  return { intent: 'unknown', confidence: 0.2 }
}
