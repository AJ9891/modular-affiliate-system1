import { ModuleContract } from '@modular-affiliate/sdk'
import { onboardingCockpitShell } from './cockpit-shell'
import { preflightSteps } from './preflight-flow'

const onboardingEngineModule: ModuleContract = {
  module_id: 'onboarding-engine',
  name: 'Onboarding Engine',
  version: '1.0.0',
  routes: [
    '/onboarding',
    '/onboarding/flows',
    '/onboarding/checklists',
    '/onboarding/preflight',
    '/onboarding/cockpit',
  ],
  templates: [
    {
      id: 'onboarding-preflight-flow-v1',
      name: 'Onboarding Preflight Flow',
      type: 'page',
      content: JSON.stringify({
        type: 'preflight-flow',
        voice: 'boost',
        steps: preflightSteps,
      }),
    },
    {
      id: 'onboarding-cockpit-shell-v1',
      name: 'Onboarding Cockpit Shell',
      type: 'page',
      content: JSON.stringify({
        type: 'cockpit-shell',
        sections: onboardingCockpitShell,
      }),
    },
    {
      id: 'onboarding-contextual-explanations-v1',
      name: 'Onboarding Contextual Explanations',
      type: 'block',
      content: JSON.stringify({
        type: 'contextual-explanations',
        style: 'explanatory',
        defaultVoice: 'boost',
      }),
    },
  ],
  assets: [],
  permissions: [
    'read:onboarding',
    'write:onboarding',
    'read:preflight',
    'write:preflight',
    'read:explanations',
  ],
}

export default onboardingEngineModule
export * from './types'
export * from './preflight-flow'
export * from './cockpit-shell'
export * from './boost-integration'
export * from './contextual-explanations'
