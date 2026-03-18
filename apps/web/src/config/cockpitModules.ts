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
    route: '/launchpad/vision-preview',
    position: { x: '73.9%', y: '11.1%' },
    shape: {
      width: '21.9%',
      height: '20.4%',
      clipPath: 'polygon(0 0, 96% 0, 100% 100%, 4% 100%)'
    },
    isVision: true
  },
  {
    id: 'radar',
    name: 'Radar',
    route: '/radar',
    position: { x: '75%', y: '38.9%' },
    shape: {
      width: '16.7%',
      height: '24.1%',
      clipPath: 'polygon(0 0, 94% 0, 100% 100%, 6% 100%)'
    }
  },
  {
    id: 'settings',
    name: 'Settings',
    route: '/system',
    position: { x: '87.8%', y: '67.8%' },
    shape: {
      width: '8.4%',
      height: '12.1%',
      clipPath: 'polygon(0 0, 90% 0, 100% 100%, 10% 100%)'
    }
  },
  {
    id: 'communications',
    name: 'Communications',
    route: '/downloads',
    position: { x: '4.2%', y: '11.1%' },
    shape: {
      width: '21.9%',
      height: '20.4%',
      clipPath: 'polygon(4% 0, 100% 0, 96% 100%, 0 100%)'
    }
  },
  {
    id: 'fuel',
    name: 'Fuel',
    route: '/subscription',
    position: { x: '6.3%', y: '38.9%' },
    shape: {
      width: '18.8%',
      height: '18.5%',
      clipPath: 'polygon(7% 0, 100% 0, 93% 100%, 0 100%)'
    }
  },
  {
    id: 'navigation',
    name: 'Navigation',
    route: '/domains',
    position: { x: '12.5%', y: '63.9%' },
    shape: {
      width: '14.6%',
      height: '16.7%',
      clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)'
    }
  },
  {
    id: 'propulsion',
    name: 'Propulsion',
    route: '/builder',
    position: { x: '28.1%', y: '39.8%' },
    shape: {
      width: '15.6%',
      height: '16.7%',
      clipPath: 'polygon(6% 0, 100% 0, 94% 100%, 0 100%)'
    }
  },
  {
    id: 'intelligence',
    name: 'Intelligence',
    route: '/ai-generator',
    position: { x: '56.3%', y: '39.8%' },
    shape: {
      width: '15.6%',
      height: '16.7%',
      clipPath: 'polygon(0 0, 94% 0, 100% 100%, 6% 100%)'
    }
  },
  {
    id: 'domains',
    name: 'Domains & Routing',
    route: '/domains',
    position: { x: '44.3%', y: '60.2%' },
    shape: {
      width: '11.5%',
      height: '15.7%',
      clipPath: 'polygon(8% 0, 100% 0, 92% 100%, 0 100%)'
    }
  }
]
