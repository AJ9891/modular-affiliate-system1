import { ModuleContract } from '@modular-affiliate/sdk'

const aiEngineModule: ModuleContract = {
  module_id: 'ai-engine',
  name: 'AI Engine',
  version: '1.0.0',
  routes: ['/ai', '/ai/workflows', '/ai/prompts'],
  templates: [],
  assets: [],
  permissions: ['read:ai', 'write:ai'],
}

export default aiEngineModule
