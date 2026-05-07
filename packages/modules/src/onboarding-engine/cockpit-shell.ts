import { type CockpitShellSection } from './types'

export const onboardingCockpitShell: CockpitShellSection[] = [
  {
    id: 'mission',
    title: 'Mission',
    description: 'What this onboarding flow is trying to complete right now.',
  },
  {
    id: 'guidance',
    title: 'Guidance',
    description: 'Boost-mode system guidance for the current preflight step.',
  },
  {
    id: 'progress',
    title: 'Progress',
    description: 'Current step completion, blockers, and readiness status.',
  },
  {
    id: 'actions',
    title: 'Actions',
    description: 'Recommended next actions with minimum ambiguity.',
  },
]

export function getOnboardingCockpitShell() {
  return onboardingCockpitShell
}
