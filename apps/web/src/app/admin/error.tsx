'use client'

import { useEffect } from 'react'
import RouteErrorState from '@/components/ui/RouteErrorState'

interface AdminErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AdminError({ error, reset }: AdminErrorProps) {
  useEffect(() => {
    console.error('Admin route error:', error)
  }, [error])

  return (
    <RouteErrorState
      shellClassName="page-command-authority"
      title="Admin console failed to load"
      message="User management and system analytics are temporarily unavailable."
      onRetry={reset}
      backHref="/dashboard"
      backLabel="Back to Dashboard"
    />
  )
}
