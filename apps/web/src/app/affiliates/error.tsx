'use client'

import { useEffect } from 'react'
import RouteErrorState from '@/components/ui/RouteErrorState'

interface AffiliatesErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AffiliatesError({ error, reset }: AffiliatesErrorProps) {
  useEffect(() => {
    console.error('Affiliates route error:', error)
  }, [error])

  return (
    <RouteErrorState
      shellClassName="page-fuel-management"
      title="Affiliates page failed to load"
      message="Referral links and commission analytics are temporarily unavailable."
      onRetry={reset}
      backHref="/dashboard"
      backLabel="Back to Dashboard"
    />
  )
}
