'use client'

import { useEffect } from 'react'
import RouteErrorState from '@/components/ui/RouteErrorState'

interface SubscribersErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function SubscribersError({ error, reset }: SubscribersErrorProps) {
  useEffect(() => {
    console.error('Subscribers route error:', error)
  }, [error])

  return (
    <RouteErrorState
      shellClassName="page-cargo-bay"
      title="Subscribers page failed to load"
      message="The contact database and subscriber activity table could not be loaded."
      onRetry={reset}
      backHref="/dashboard"
      backLabel="Back to Dashboard"
    />
  )
}
