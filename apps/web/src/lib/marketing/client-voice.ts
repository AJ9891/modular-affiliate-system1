import { CANONICAL_PERSONALITIES, type PersonalityId } from '@/lib/personality/canonical-definitions'

/**
 * Shared voice contract for ads and follow-up content.
 * Keep all personality definitions in canonical-definitions.ts.
 */
export type ClientVoice = PersonalityId
export type MarketingChannel = 'advertisement' | 'email'
export type FollowupStage = 'welcome' | 'nurture' | 'offer' | 'reminder'

export function resolveClientVoice(value: unknown): ClientVoice {
  if (typeof value !== 'string') {
    throw new Error('Client voice must be selected before generating marketing copy')
  }
  const normalized = value.trim().toLowerCase()
  if (normalized === 'rocket' || normalized === 'rocket_future' || normalized === 'boost') return 'boost'
  if (normalized === 'ai_meltdown' || normalized === 'glitch') return 'glitch'
  if (normalized === 'anti_guru' || normalized === 'anti-guru' || normalized === 'anchor') return 'anchor'
  throw new Error('Unknown client voice: choose Glitch, Rocket/Boost, or Anchor')
}

export interface MarketingPromptInput {
  clientVoice: ClientVoice
  channel: MarketingChannel
  productName: string
  verifiedBenefits: string[]
  targetAudience: string
  callToAction: string
  stage?: FollowupStage
}

export function buildMarketingPrompt(input: MarketingPromptInput): string {
  const voice = CANONICAL_PERSONALITIES[input.clientVoice]
  if (!input.productName.trim() || !input.targetAudience.trim() || !input.callToAction.trim()) {
    throw new Error('Product, audience, and call to action are required')
  }
  if (!input.verifiedBenefits.length || input.verifiedBenefits.some((item) => !item.trim())) {
    throw new Error('At least one verified benefit is required')
  }

  const channelRules = input.channel === 'email'
    ? 'Return JSON with subject, preheader, html, and text. Write at approximately fifth-grade reading level. Include a truthful call to action, clear sender identity, and an unsubscribe-link placeholder {{unsubscribe_url}}. Never fabricate testimonials.'
    : 'Return JSON with headline, body, and callToAction. Keep claims factual and do not promise income or results.'

  const welcomeRule = input.stage === 'welcome'
    ? 'This is the first email. Write from Launchpad4 Success in a neutral, friendly welcome voice; do not impersonate a personality. Later emails use the selected client voice.'
    : 'Use only the selected personality. Never blend in another personality.'

  return [
    'You write marketing content for Launchpad4 Success.',
    'Follow the selected client voice for both email and advertising.',
    `Selected voice: ${voice.shortName} (${voice.name}).`,
    `Voice tone: ${voice.voice.tone}; attitude: ${voice.voice.attitude}; approach: ${voice.voice.approach}.`,
    `Purpose: ${voice.philosophy.purpose}.`,
    welcomeRule,
    channelRules,
    'Do not invent product capabilities, outcomes, urgency, discounts, endorsements, or numerical claims.',
    'Respect marketing consent and avoid shaming or manipulative language.',
    `Product: ${input.productName}.`,
    `Audience: ${input.targetAudience}.`,
    `Verified benefits: ${JSON.stringify(input.verifiedBenefits)}.`,
    `CTA: ${input.callToAction}.`,
    `Channel: ${input.channel}; stage: ${input.stage ?? 'n/a'}.`,
  ].join('\\n')
}
