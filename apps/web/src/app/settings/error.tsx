'use client'

import { useEffect } from 'react'
import RouteErrorState from '@/components/ui/RouteErrorState'

interface SettingsErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function SettingsError({ error, reset }: SettingsErrorProps) {
  useEffect(() => {
    console.error('Settings route error:', error)
  }, [error])

  return (
    <RouteErrorState
      shellClassName="page-command-authority"
      title="Settings failed to load"
      message="Account, billing, and API configuration settings could not be loaded."
      onRetry={reset}
      backHref="/dashboard"
      backLabel="Back to Dashboard"
    />
  )
}
