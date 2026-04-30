export type GuidedBuilderModuleId = 'hero' | 'offer' | 'cta' | 'proof'

export interface GuidedBuilderModule {
  id: GuidedBuilderModuleId
  title: string
  explanation: string
}

export const GUIDED_BUILDER_MODULES: readonly GuidedBuilderModule[] = [
  {
    id: 'hero',
    title: 'Hero',
    explanation: 'This is your flight plan headline. It tells visitors what changes for them here.',
  },
  {
    id: 'offer',
    title: 'Offer',
    explanation: 'This is your payload: what visitors get, why it matters, and why now.',
  },
  {
    id: 'cta',
    title: 'CTA',
    explanation: 'This is your throttle. Keep one clear next action and remove side paths.',
  },
  {
    id: 'proof',
    title: 'Proof',
    explanation: 'This is your instrument check. Evidence reduces doubt before commitment.',
  },
] as const

export const GUIDED_BUILDER_IDLE_PROMPT_DELAY_MS = 12000
export const GUIDED_BUILDER_HIGHLIGHT_INTERVAL_MS = 2600

export function getNextGuidedBuilderModuleIndex(currentIndex: number, totalModules: number): number {
  if (totalModules <= 0) return 0
  return (currentIndex + 1) % totalModules
}

export function getGuidedBuilderHelpMessage(moduleId: GuidedBuilderModuleId): string {
  if (moduleId === 'hero') {
    return 'Need help here? We can walk this together. Start with a one-sentence promise, then one line of audience context.'
  }
  if (moduleId === 'offer') {
    return 'Need help here? We can walk this together. Focus on outcome, delivery, and why this offer is credible.'
  }
  if (moduleId === 'cta') {
    return 'Need help here? We can walk this together. Pick one next action and make the button text explicit.'
  }
  return 'Need help here? We can walk this together. Add one concrete proof artifact tied to the exact promise above.'
}

