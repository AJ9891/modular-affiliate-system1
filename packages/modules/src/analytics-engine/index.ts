import { ModuleContract } from '@modular-affiliate/sdk'

const analyticsEngineModule: ModuleContract = {
  module_id: 'analytics-engine',
  name: 'Analytics Engine',
  version: '1.0.0',
  routes: ['/analytics', '/analytics/dashboards', '/analytics/reports'],
  templates: [],
  assets: [],
  permissions: ['read:analytics', 'write:analytics'],
}

export default analyticsEngineModule
