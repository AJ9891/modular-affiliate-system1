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

function getRoomClass(pathname: string): RoomClass {
  if (
    pathname.startsWith('/cockpit') ||
    pathname.startsWith('/navigation') ||
    pathname.startsWith('/communications') ||
    pathname.startsWith('/system')
  ) {
    return 'page-flight-deck'
  }

  if (
    pathname.startsWith('/propulsion') ||
    pathname.startsWith('/fuel') ||
    pathname.startsWith('/builder') ||
    pathname.startsWith('/visual-builder')
  ) {
    return 'page-engineering-bay'
  }

  if (
    pathname.startsWith('/radar') ||
    pathname.startsWith('/analytics') ||
    pathname.startsWith('/dashboard')
  ) {
    return 'page-telemetry'
  }

  if (
    pathname.startsWith('/ai-generator') ||
    pathname.startsWith('/ai-optimizer') ||
    pathname.startsWith('/intelligence')
  ) {
    return 'page-ai-core'
  }

  if (pathname.startsWith('/subscription') || pathname.startsWith('/checkout') || pathname.startsWith('/offers')) {
    return 'page-fuel-management'
  }

  if (
    pathname.startsWith('/domains') ||
    pathname.startsWith('/downloads') ||
    pathname.startsWith('/example-download') ||
    pathname.startsWith('/f/') ||
    pathname.startsWith('/p/') ||
    pathname.startsWith('/subdomain/')
  ) {
    return 'page-cargo-bay'
  }

  if (pathname.startsWith('/team') || pathname.startsWith('/welcome')) {
    return 'page-crew'
  }

  if (pathname.startsWith('/admin') || pathname.startsWith('/settings') || pathname.startsWith('/monetization')) {
    return 'page-command-authority'
  }

  return 'page-mission-control'
}

export function ShipRoomStyler() {
  const pathname = usePathname()

  useLayoutEffect(() => {
    const body = document.body
    const isLaunchpadRoute = pathname === '/launchpad' || pathname.startsWith('/launchpad/')

    body.classList.remove('cockpit-shell', ...ROOM_CLASSES)

    if (isLaunchpadRoute) {
      return
    }

    body.classList.add('cockpit-shell', getRoomClass(pathname))

    return () => {
      body.classList.remove('cockpit-shell', ...ROOM_CLASSES)
    }
  }, [pathname])

  return null
}
