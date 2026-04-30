export type LaunchpadIntentId = 'first-funnel' | 'import-traffic' | 'setup-email'

export interface LaunchpadIntentOption {
  id: LaunchpadIntentId
  label: string
  description: string
}

export interface LaunchpadIntentPreset {
  nextStep: number
  notice: string
  suggestedNiche: string
  suggestedTemplate: string
}

export const LAUNCHPAD_INTENT_OPTIONS: readonly LaunchpadIntentOption[] = [
  {
    id: 'first-funnel',
    label: 'Create my first funnel',
    description: 'Guide me through the fastest path from idea to live funnel.',
  },
  {
    id: 'import-traffic',
    label: 'Import traffic data',
    description: 'Help me set tracking foundations so incoming traffic is measurable.',
  },
  {
    id: 'setup-email',
    label: 'Set up email automation',
    description: 'I want follow-up sequences ready as soon as leads come in.',
  },
] as const

export function isLaunchpadIntentId(value: string): value is LaunchpadIntentId {
  return LAUNCHPAD_INTENT_OPTIONS.some((option) => option.id === value)
}

const INTENT_PRESETS: Record<LaunchpadIntentId, LaunchpadIntentPreset> = {
  'first-funnel': {
    nextStep: 1,
    notice: 'Mission locked: first funnel launch. We will walk you from niche selection to publish.',
    suggestedNiche: 'general',
    suggestedTemplate: 'lead-gen',
  },
  'import-traffic': {
    nextStep: 1,
    notice: 'Mission locked: traffic visibility. We will create a funnel with tracking-ready flow.',
    suggestedNiche: 'technology',
    suggestedTemplate: 'review',
  },
  'setup-email': {
    nextStep: 1,
    notice: 'Mission locked: email automation. We will prepare a lead funnel and fast-track follow-up setup.',
    suggestedNiche: 'education',
    suggestedTemplate: 'lead-gen',
  },
}

export function getIntentPreset(intentId: LaunchpadIntentId): LaunchpadIntentPreset {
  return INTENT_PRESETS[intentId]
}
