export const DOMAIN_EVENT_NAMES = [
  'user.signup.completed',
  'plan.changed',
  'onboarding.stage.changed',
  'template.applied',
  'ai.decision.recorded',
] as const

export type DomainEventName = (typeof DOMAIN_EVENT_NAMES)[number]

export interface DomainEvent<TPayload = Record<string, unknown>> {
  name: DomainEventName
  userId: string
  occurredAt: string
  payload: TPayload
}
