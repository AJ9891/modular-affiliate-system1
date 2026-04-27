'use client'

import { useEffect } from 'react'
import RouteErrorState from '@/components/ui/RouteErrorState'

interface FunnelEditorErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function FunnelEditorError({ error, reset }: FunnelEditorErrorProps) {
  useEffect(() => {
    console.error('Funnel editor route error:', error)
  }, [error])

  return (
    <RouteErrorState
      shellClassName="page-engineering-bay"
      title="Funnel editor failed to load"
      message="The selected funnel editor could not be rendered."
      onRetry={reset}
      backHref="/funnels"
      backLabel="Back to Funnels"
    />
  )
}
