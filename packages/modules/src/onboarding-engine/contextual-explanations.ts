import { type ContextualExplanation, type PreflightStepId } from './types'

const explanationMap: Record<PreflightStepId, ContextualExplanation> = {
  intent: {
    key: 'intent',
    title: 'Why Intent Comes First',
    body: 'Intent controls structure, CTA strategy, and offer framing. Changing intent late causes avoidable rewrites.',
  },
  audience: {
    key: 'audience',
    title: 'Why Audience Is Required',
    body: 'Audience clarity prevents generic copy. Specific audience inputs improve relevance and reduce conversion noise.',
  },
  offer: {
    key: 'offer',
    title: 'Why Offer Attachment Matters',
    body: 'Offer linkage connects funnel behavior to revenue outcomes. Without it, analytics can show motion without business value.',
  },
  tracking: {
    key: 'tracking',
    title: 'Why Tracking Must Be Connected',
    body: 'Tracking confirms whether traffic converts. Launching without it removes diagnostic visibility when performance drops.',
  },
  'publish-readiness': {
    key: 'publish-readiness',
    title: 'Why Preflight Readiness Exists',
    body: 'Readiness checks catch final defects before launch. Fixing issues pre-launch is cheaper than rollback after traffic starts.',
  },
}

export function getContextualExplanation(stepId: PreflightStepId): ContextualExplanation {
  return explanationMap[stepId]
}
