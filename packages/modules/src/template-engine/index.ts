import { ModuleContract } from '@modular-affiliate/sdk'
import { templateMetadataContracts } from './contracts'

const templateEngineModule: ModuleContract = {
  module_id: 'template-engine',
  name: 'Template Engine',
  version: '1.0.0',
  routes: [
    '/templates',
    '/templates/library',
    '/templates/editor',
    '/templates/contracts',
    '/templates/generate',
  ],
  templates: [
    {
      id: 'template-metadata-contracts-v1',
      name: 'Template Metadata Contracts',
      type: 'page',
      content: JSON.stringify({
        type: 'metadata-contracts',
        contracts: templateMetadataContracts,
      }),
    },
    {
      id: 'voice-bound-template-rules-v1',
      name: 'Voice-Bound Template Rules',
      type: 'block',
      content: JSON.stringify({
        type: 'voice-bound-rules',
        rule: 'Template voice must match requested generation voice.',
        voices: ['boost', 'anti-guru', 'glitch'],
      }),
    },
    {
      id: 'ai-safe-generation-rules-v1',
      name: 'AI-Safe Generation Rules',
      type: 'block',
      content: JSON.stringify({
        type: 'ai-safe-generation',
        blockedPatterns: [
          'guaranteed income',
          'risk-free',
          'limited time only',
          'act now',
          'secret method',
        ],
      }),
    },
  ],
  assets: [],
  permissions: [
    'read:templates',
    'write:templates',
    'read:template-contracts',
    'generate:templates',
  ],
}

export default templateEngineModule
export * from './types'
export * from './contracts'
export * from './metadata-contracts'
export * from './voice-bound-templates'
export * from './ai-safe-generation'
