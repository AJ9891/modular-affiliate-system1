'use client'

import { useEffect } from 'react'
import RouteErrorState from '@/components/ui/RouteErrorState'

interface FunnelsErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function FunnelsError({ error, reset }: FunnelsErrorProps) {
  useEffect(() => {
    console.error('Funnels route error:', error)
  }, [error])

  return (
    <RouteErrorState
      shellClassName="page-engineering-bay"
      title="Funnels workspace unavailable"
      message="We could not load your funnel list and composer controls."
      onRetry={reset}
      backHref="/dashboard"
      backLabel="Back to Dashboard"
    />
  )
}
