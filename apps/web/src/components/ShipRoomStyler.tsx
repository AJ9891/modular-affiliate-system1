'use client'

import { useLayoutEffect } from 'react'
import { usePathname } from 'next/navigation'

type RoomClass =
  | 'page-mission-control'
  | 'page-flight-deck'
  | 'page-engineering-bay'
  | 'page-telemetry'
  | 'page-ai-core'
  | 'page-fuel-management'
  | 'page-cargo-bay'
  | 'page-crew'
  | 'page-command-authority'

const ROOM_CLASSES: RoomClass[] = [
  'page-mission-control',
  'page-flight-deck',
  'page-engineering-bay',
  'page-telemetry',
  'page-ai-core',
  'page-fuel-management',
  'page-cargo-bay',
  'page-crew',
  'page-command-authority',
]

const ROOM_PREFIXES: Record<RoomClass, string[]> = {
  'page-flight-deck': ['/cockpit', '/navigation', '/communications', '/system', '/launchpad'],
  'page-engineering-bay': ['/propulsion', '/fuel', '/builder', '/builder-v2', '/visual-builder', '/funnels'],
  'page-telemetry': ['/radar', '/analytics', '/dashboard'],
  'page-ai-core': ['/ai-generator', '/link-funnel', '/ai-optimizer', '/intelligence'],
  'page-fuel-management': ['/subscription', '/checkout', '/offers', '/pricing', '/monetization'],
  'page-cargo-bay': ['/domains', '/downloads', '/example-download', '/f', '/p', '/subdomain', '/affiliates', '/subscribers', '/email'],
  'page-crew': ['/team', '/welcome', '/login', '/signup', '/support', '/docs'],
  'page-command-authority': ['/admin', '/settings', '/debug', '/check-downloads', '/do_not_click'],
  'page-mission-control': ['/about', '/features', '/get-started', '/niches'],
}

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

function getRoomClass(pathname: string): RoomClass {
  for (const room of ROOM_CLASSES) {
    const prefixes = ROOM_PREFIXES[room]
    if (prefixes.some((prefix) => matchesPrefix(pathname, prefix))) {
      return room
    }
  }

  return 'page-mission-control'
}

function roomClassToKey(roomClass: RoomClass): string {
  return roomClass.replace('page-', '')
}

export function ShipRoomStyler() {
  const pathname = usePathname()

  useLayoutEffect(() => {
    const body = document.body
    const roomClass = getRoomClass(pathname)

    body.classList.remove('cockpit-shell', ...ROOM_CLASSES)
    body.classList.add('cockpit-shell', roomClass)
    body.dataset.shipRoom = roomClassToKey(roomClass)

    return () => {
      body.classList.remove('cockpit-shell', ...ROOM_CLASSES)
      delete body.dataset.shipRoom
    }
  }, [pathname])

  return null
}
