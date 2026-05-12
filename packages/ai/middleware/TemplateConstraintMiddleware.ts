import type { MiddlewareEnvelope, TemplateConstraintSet } from './types'

const DEFAULT_TEMPLATE_CONSTRAINTS: TemplateConstraintSet = {
  maxClaims: 3,
  bannedPhrases: ['guaranteed overnight success', 'everyone will buy', 'risk-free forever'],
}

export function injectTemplateConstraints(
  envelope: MiddlewareEnvelope,
  constraints: TemplateConstraintSet = DEFAULT_TEMPLATE_CONSTRAINTS,
): MiddlewareEnvelope {
  return {
    ...envelope,
    templateConstraints: constraints,
    metadata: {
      ...envelope.metadata,
      template_constraints: constraints,
    },
  }
}
