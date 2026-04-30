export type LaunchpadStepId =
  | 'welcome'
  | 'niche'
  | 'funnel'
  | 'offers'
  | 'email'
  | 'launch'

export function isLaunchpadStepId(value: string): value is LaunchpadStepId {
  return (
    value === 'welcome' ||
    value === 'niche' ||
    value === 'funnel' ||
    value === 'offers' ||
    value === 'email' ||
    value === 'launch'
  )
}

const STEP_UNLOCK_MESSAGES: Record<LaunchpadStepId, string> = {
  welcome: 'Mission context unlocked. You now have the full launch sequence before configuration.',
  niche: 'Niche alignment unlocked. Copy and offer framing can now match one audience.',
  funnel: 'Guided builder unlocked. You can now shape hero, offer, CTA, and proof flow.',
  offers: 'Monetization routing unlocked. CTA paths can now attach to real offer destinations.',
  email: 'Follow-up engine unlocked. New leads can be nurtured automatically after first visit.',
  launch: 'Launch controls unlocked. You can run checks and publish with telemetry ready.',
}

const STEP_HESITATION_TIPS: Record<LaunchpadStepId, string> = {
  welcome: 'If this feels like a lot, start by selecting your first destination. We will handle sequence pacing.',
  niche: 'This filter is great for paid traffic. If you want organic behavior, pick the niche closest to search intent.',
  funnel: 'Start simple: choose one template and tune the hero promise before touching advanced sections.',
  offers: 'Attach one offer first. You can swap and govern links later without rebuilding this funnel.',
  email: 'Enable automation now even if copy is rough. You can refine sequences after the first lead arrives.',
  launch: 'Run checks before publishing. If preview and CTA redirect pass, you are safe to launch.',
}

export function getStepUnlockMessage(stepId: LaunchpadStepId): string {
  return STEP_UNLOCK_MESSAGES[stepId]
}

export function getHesitationTip(stepId: LaunchpadStepId): string {
  return STEP_HESITATION_TIPS[stepId]
}
