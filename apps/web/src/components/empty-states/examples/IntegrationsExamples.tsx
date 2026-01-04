/**
 * Integrations Page Empty State Examples
 * 
 * Demonstrates usage for integrations and external connections
 */

'use client'

import React from 'react'
import { useEmptyState } from '@/hooks/useEmptyState'
import { EmptyState } from '@/components/empty-states/EmptyState'
import { RecoverableError } from '@/components/empty-states/RecoverableError'
import { HardError } from '@/components/empty-states/HardError'
import { Plug, AlertCircle } from 'lucide-react'

/**
 * Example 1: No integrations connected yet
 */
export function IntegrationsEmpty() {
  const { contract, visuals } = useEmptyState({
    category: 'empty-expected',
    severity: 'info',
    primaryAction: {
      label: 'Browse Integrations',
      onClick: () => console.log('Open integrations catalog')
    }
  })
  
  return (
    <EmptyState 
      contract={contract} 
      visuals={visuals}
      icon={<Plug className="w-16 h-16 text-gray-400" />}
    />
  )
}

/**
 * Example 2: Integration disconnected (recoverable)
 */
export function IntegrationDisconnectedError() {
  const { contract } = useEmptyState({
    category: 'recoverable-error',
    severity: 'warning',
    headline: 'Stripe connection lost',
    body: 'Reconnect your Stripe account to continue processing payments.',
    primaryAction: {
      label: 'Reconnect Stripe',
      onClick: () => console.log('Start Stripe OAuth flow')
    },
    secondaryAction: {
      label: 'Disable Integration',
      onClick: () => console.log('Disable Stripe')
    }
  })
  
  return <RecoverableError contract={contract} />
}

/**
 * Example 3: API key validation failed (recoverable)
 */
export function IntegrationValidationError() {
  const { contract } = useEmptyState({
    category: 'recoverable-error',
    severity: 'warning',
    headline: 'API key invalid',
    body: 'The API key you entered couldn\'t be verified. Please check and try again.',
    primaryAction: {
      label: 'Update Key',
      onClick: () => console.log('Open API key form')
    }
  })
  
  return <RecoverableError contract={contract} />
}

/**
 * Example 4: Integration service is down (hard error)
 */
export function IntegrationServiceDownError() {
  const { contract } = useEmptyState({
    category: 'hard-error',
    severity: 'error',
    headline: 'Service unavailable',
    body: 'The integration service is currently down. We\'re monitoring the situation. Your data is safe.',
    secondaryAction: {
      label: 'Check Status Page',
      onClick: () => console.log('Open status page')
    }
  })
  
  return <HardError contract={contract} />
}

/**
 * Example 5: Search returned no results
 */
export function IntegrationSearchEmpty() {
  const { contract, visuals } = useEmptyState({
    category: 'empty-unexpected',
    severity: 'info',
    headline: 'No integrations found',
    body: 'Try a different search term or browse all integrations.',
    primaryAction: {
      label: 'Clear Search',
      onClick: () => console.log('Clear search input')
    },
    secondaryAction: {
      label: 'Browse All',
      onClick: () => console.log('Show all integrations')
    }
  })
  
  return (
    <EmptyState 
      contract={contract} 
      visuals={visuals}
      icon={<AlertCircle className="w-12 h-12 text-gray-400" />}
    />
  )
}
