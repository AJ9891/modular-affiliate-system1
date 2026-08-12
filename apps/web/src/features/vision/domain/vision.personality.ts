import type { BrandModeKey } from '@/contexts/BrandModeContext'

export function phraseVisionRecommendation(mode: BrandModeKey, reason: string, label: string): string {
  if (mode === 'antiguru') return `${reason} The practical next move is ${label}.`
  if (mode === 'meltdown') return `${reason} So yes, the machine recommends ${label}. Wildly sensible.`
  return `${reason} Your highest-leverage next move is ${label}.`
}
