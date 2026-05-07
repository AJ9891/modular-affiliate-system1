import { ModuleContract } from '@modular-affiliate/sdk'

const funnelEngineModule: ModuleContract = {
  module_id: 'funnel-engine',
  name: 'Funnel Engine',
  version: '1.0.0',
  routes: ['/funnels', '/funnels/builder', '/funnels/templates'],
  templates: [],
  assets: [],
  permissions: ['read:funnels', 'write:funnels'],
}

export default funnelEngineModule
