export interface CockpitModule {
  id: string
  name: string
  route: string
  position: { x: string; y: string }
  shape: { width: string; height: string; clipPath?: string }
  isVision?: boolean
}

export const COCKPIT_MODULES: CockpitModule[] = [
  {
    id: 'vision',
    name: 'Launchpad 4 Vision',
    route: '#vision',
    position: { x: '69%', y: '8%' },
    shape: { width: '26%', height: '26%' },
    isVision: true
  },
  {
    id: 'radar',
    name: 'Radar',
    route: '/radar',
    position: { x: '69%', y: '45%' },
    shape: { width: '23%', height: '28%' }
  },
  {
    id: 'settings',
    name: 'Settings',
    route: '/settings',
    position: { x: '82%', y: '62%' },
    shape: { width: '10%', height: '14%' }
  },
  {
    id: 'communications',
    name: 'Communications',
    route: '/communications',
    position: { x: '6%', y: '10%' },
    shape: { width: '24%', height: '24%' }
  },
  {
    id: 'fuel',
    name: 'Fuel',
    route: '/subscription',
    position: { x: '9%', y: '38%' },
    shape: { width: '22%', height: '18%' }
  },
  {
    id: 'navigation',
    name: 'Navigation',
    route: '/domains',
    position: { x: '44%', y: '60%' },
    shape: { width: '12%', height: '18%' }
  },
  {
    id: 'propulsion',
    name: 'Propulsion',
    route: '/builder-v2',
    position: { x: '34%', y: '42%' },
    shape: { width: '20%', height: '16%' }
  },
  {
    id: 'intelligence',
    name: 'Intelligence',
    route: '/ai-generator',
    position: { x: '46%', y: '42%' },
    shape: { width: '20%', height: '16%' }
  },
  {
    id: 'domains',
    name: 'Domains & Routing',
    route: '/domains',
    position: { x: '10%', y: '58%' },
    shape: { width: '18%', height: '18%' }
  }
]
