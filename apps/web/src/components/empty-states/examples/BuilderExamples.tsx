/**
 * Builder Empty State Examples
 * 
 * Demonstrates proper usage of empty states in the funnel builder
 */

'use client'

import React from 'react'
import { useEmptyState } from '@/hooks/useEmptyState'
import { EmptyState } from '@/components/empty-states/EmptyState'
import { RecoverableError } from '@/components/empty-states/RecoverableError'
import { HardError } from '@/components/empty-states/HardError'
import { FileText, Plus } from 'lucide-react'

/**
 * Example 1: Empty-but-expected - New funnel builder
 */
export function BuilderEmptyState() {
  const { contract, visuals } = useEmptyState({
    category: 'empty-expected',
    severity: 'info',
    primaryAction: {
      label: 'Add Your First Block',
      onClick: () => console.log('Open block library')
    },
    secondaryAction: {
      label: 'Use Template',
      onClick: () => console.log('Open templates')
    }
  })
  
  return (
    <EmptyState 
      contract={contract} 
      visuals={visuals}
      icon={<FileText className="w-16 h-16 text-gray-400" />}
    />
  )
}

/**
 * Example 2: Recoverable error - Template failed to load
 */
export function BuilderTemplateError() {
  const { contract } = useEmptyState({
    category: 'recoverable-error',
    severity: 'warning',
    headline: 'Template couldn\'t load',
    body: 'We\'ll try again automatically, or you can start from scratch.',
    primaryAction: {
      label: 'Retry',
      onClick: () => console.log('Retry loading template')
    },
    secondaryAction: {
      label: 'Start From Scratch',
      onClick: () => console.log('Create blank funnel')
    }
  })
  
  return <RecoverableError contract={contract} />
}

/**
 * Example 3: Hard error - Save failed due to auth
 */
export function BuilderAuthError() {
  const { contract } = useEmptyState({
    category: 'hard-error',
    severity: 'error',
    headline: 'Unable to save your changes',
    body: 'Your session has expired. Please sign in again to continue.',
    primaryAction: {
      label: 'Sign In',
      onClick: () => console.log('Redirect to login')
    }
  })
  
  return <HardError contract={contract} />
}
