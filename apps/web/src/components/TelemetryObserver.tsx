'use client'

import { useEffect } from 'react'
import { trackPageView } from '@/lib/telemetry'
import { logError } from '@/lib/logging'

export function TelemetryObserver() {
  useEffect(() => {
    try {
      trackPageView()
    } catch (err) {
      logError(err, { source: 'trackPageView' })
    }
  }, [])

  return null
}
