'use client'

import { useEffect } from 'react'
import RouteErrorState from '@/components/ui/RouteErrorState'

interface DashboardErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error('Dashboard route error:', error)
  }, [error])

  return (
    <RouteErrorState
      shellClassName="page-mission-control"
      title="Dashboard failed to load"
      message="We hit an issue loading your dashboard metrics and activity feed."
      onRetry={reset}
      backHref="/cockpit"
      backLabel="Back to Cockpit"
    />
  )
}
