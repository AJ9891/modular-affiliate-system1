'use client'

import { useEffect } from 'react'
import RouteErrorState from '@/components/ui/RouteErrorState'

interface AnalyticsErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AnalyticsError({ error, reset }: AnalyticsErrorProps) {
  useEffect(() => {
    console.error('Analytics route error:', error)
  }, [error])

  return (
    <RouteErrorState
      shellClassName="page-telemetry"
      title="Analytics failed to load"
      message="Traffic and conversion analytics are temporarily unavailable."
      onRetry={reset}
      backHref="/dashboard"
      backLabel="Back to Dashboard"
    />
  )
}
