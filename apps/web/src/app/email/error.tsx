'use client'

import { useEffect } from 'react'
import RouteErrorState from '@/components/ui/RouteErrorState'

interface EmailErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function EmailError({ error, reset }: EmailErrorProps) {
  useEffect(() => {
    console.error('Email route error:', error)
  }, [error])

  return (
    <RouteErrorState
      shellClassName="page-crew"
      title="Email workspace failed to load"
      message="Campaign and automation controls could not be loaded."
      onRetry={reset}
      backHref="/dashboard"
      backLabel="Back to Dashboard"
    />
  )
}
