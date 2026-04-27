'use client'

import { useEffect } from 'react'
import RouteErrorState from '@/components/ui/RouteErrorState'

interface TemplatesErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function TemplatesError({ error, reset }: TemplatesErrorProps) {
  useEffect(() => {
    console.error('Templates route error:', error)
  }, [error])

  return (
    <RouteErrorState
      shellClassName="page-ai-core"
      title="Template library failed to load"
      message="Landing and email template data is temporarily unavailable."
      onRetry={reset}
      backHref="/dashboard"
      backLabel="Back to Dashboard"
    />
  )
}
