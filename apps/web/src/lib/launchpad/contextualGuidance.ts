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
  welcome: 'Mission context unlocked. You now have the full launch sequence before configuration. Start planning your traffic sources now.',
  niche: 'Niche alignment unlocked. Copy and offer framing can now match one audience. This guides your traffic targeting.',
  funnel: 'Guided builder unlocked. You can now shape hero, offer, CTA, and proof flow. Each element converts traffic.',
  offers: 'Monetization routing unlocked. CTA paths can now attach to real offer destinations. Your traffic will decide which offers win.',
  email: 'Follow-up engine unlocked. New leads from your traffic can be nurtured automatically after first visit.',
  launch: 'Launch controls unlocked. You can run checks and publish with telemetry ready. Start driving traffic immediately after launch.',
}

const STEP_HESITATION_TIPS: Record<LaunchpadStepId, string> = {
  welcome: 'If this feels like a lot, start by selecting your first destination. We will handle sequence pacing. Remember: this all depends on traffic, so prep your sources now.',
  niche: 'This filter is great for paid traffic. If you want organic behavior, pick the niche closest to search intent. Traffic alignment makes or breaks early conversion.',
  funnel: 'Start simple: choose one template and tune the hero promise before touching advanced sections. A tight funnel with good traffic beats perfect copy with no visitors.',
  offers: 'Attach one offer first. You can swap and govern links later without rebuilding this funnel. Your traffic will tell you what offers work.',
  email: 'Enable automation now even if copy is rough. You can refine sequences after the first lead arrives. Email nurtures traffic into customers.',
  launch: 'Run checks before publishing. If preview and CTA redirect pass, you are safe to launch. Once live, focus on driving traffic to test and learn.',
}

export function getStepUnlockMessage(stepId: LaunchpadStepId): string {
  return STEP_UNLOCK_MESSAGES[stepId]
}

export function getHesitationTip(stepId: LaunchpadStepId): string {
  return STEP_HESITATION_TIPS[stepId]
}
