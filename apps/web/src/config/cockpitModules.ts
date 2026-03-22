export interface CockpitPoint {
  x: number
  y: number
}

export type CockpitCorners = [CockpitPoint, CockpitPoint, CockpitPoint, CockpitPoint]

export interface CockpitModule {
  id: string
  name: string
  route: string
  // Exact hotspot corners in percentage space (0..100) over the cockpit background.
  corners: CockpitCorners
  isVision?: boolean
}

export const COCKPIT_MODULES: CockpitModule[] = [
  {
    id: 'vision',
    name: 'Vision',
    route: '/launchpad/vision-preview',
    corners: [
      { x: 80.8108108108108, y: 14.837337337337337 },
      { x: 96.21621621621622, y: 7.149649649649651 },
      { x: 95.67567567567568, y: 28.77127127127127 },
      { x: 79.36936936936937, y: 29.73223223223223 }
    ],
    isVision: true
  },
  {
    id: 'radar',
    name: 'Radar',
    route: '/radar',
    corners: [
      { x: 72.25225225225225, y: 35.97847847847848 },
      { x: 87.74774774774775, y: 41.1036036036036 },
      { x: 84.77477477477477, y: 59.04154154154154 },
      { x: 69.36936936936937, y: 52.31481481481482 }
    ]
  },
  {
    id: 'settings',
    name: 'Systems',
    route: '/settings',
    corners: [
      { x: 89.54954954954954, y: 63.045545545545544 },
      { x: 95.4954954954955, y: 65.60810810810811 },
      { x: 90.54054054054053, y: 73.61611611611612 },
      { x: 85.13513513513513, y: 69.45195195195195 }
    ]
  },
  {
    id: 'communications',
    name: 'Comms',
    route: '/communications',
    corners: [
      { x: 5.675675675675676, y: 8.911411411411411 },
      { x: 20, y: 14.997497497497497 },
      { x: 20.81081081081081, y: 31.013513513513512 },
      { x: 5.7657657657657655, y: 29.251751751751755 }
    ]
  },
  {
    id: 'fuel',
    name: 'Fuel',
    route: '/monetization',
    corners: [
      { x: 11.891891891891893, y: 41.42392392392392 },
      { x: 22.882882882882882, y: 37.9004004004004 },
      { x: 24.684684684684687, y: 47.510010010010014 },
      { x: 13.063063063063062, y: 51.99449449449449 }
    ]
  },
  {
    id: 'navigation',
    name: 'Navigation',
    route: '/navigation',
    corners: [
      { x: 7.837837837837839, y: 61.92442442442443 },
      { x: 12.972972972972974, y: 58.4009009009009 },
      { x: 15.405405405405407, y: 61.92442442442443 },
      { x: 11.17117117117117, y: 65.60810810810811 }
    ]
  },
  {
    id: 'propulsion',
    name: 'Propulsion',
    route: '/propulsion',
    corners: [
      { x: 32.25225225225225, y: 36.61911911911912 },
      { x: 42.432432432432435, y: 36.61911911911912 },
      { x: 42.34234234234234, y: 46.54904904904905 },
      { x: 32.34234234234235, y: 46.54904904904905 }
    ]
  },
  {
    id: 'intelligence',
    name: 'Intelligence',
    route: '/intelligence',
    corners: [
      { x: 51.621621621621614, y: 36.77927927927928 },
      { x: 64.41441441441441, y: 36.61911911911912 },
      { x: 64.41441441441441, y: 45.588088088088085 },
      { x: 51.621621621621614, y: 45.588088088088085 }
    ]
  },
  {
    id: 'telemetry',
    name: 'Telemetry',
    route: '/dashboard',
    corners: [
      { x: 46.846846846846844, y: 50.392892892892895 },
      { x: 52.792792792792795, y: 50.553053053053056 },
      { x: 53.153153153153156, y: 59.04154154154154 },
      { x: 47.207207207207205, y: 58.88138138138138 }
    ]
  }
]
