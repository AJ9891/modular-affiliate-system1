/**
 * Dashboard Empty State Examples
 * 
 * Demonstrates proper usage in the main dashboard
 */

'use client'

import React from 'react'
import { useEmptyState } from '@/hooks/useEmptyState'
import { EmptyState } from '@/components/empty-states/EmptyState'
import { RecoverableError } from '@/components/empty-states/RecoverableError'
import { Rocket, BarChart3 } from 'lucide-react'

/**
 * Example 1: No funnels created yet
 */
export function DashboardEmptyFunnels() {
  const { contract, visuals } = useEmptyState({
    category: 'empty-expected',
    severity: 'info',
    primaryAction: {
      label: 'Create Your First Funnel',
      onClick: () => console.log('Navigate to builder')
    },
    secondaryAction: {
      label: 'Browse Templates',
      onClick: () => console.log('Open template gallery')
    }
  })
  
  return (
    <EmptyState 
      contract={contract} 
      visuals={visuals}
      icon={<Rocket className="w-16 h-16 text-blue-500" />}
    />
  )
}

/**
 * Example 2: Analytics data failed to load
 */
export function DashboardAnalyticsError() {
  const { contract } = useEmptyState({
    category: 'empty-unexpected',
    severity: 'warning',
    headline: 'Analytics temporarily unavailable',
    body: 'We\'re having trouble loading your data. Your funnels are still running normally.',
    primaryAction: {
      label: 'Refresh',
      onClick: () => console.log('Retry analytics')
    }
  })
  
  return <RecoverableError contract={contract} />
}

/**
 * Example 3: No analytics data yet (expected)
 */
export function DashboardNoAnalytics() {
  const { contract, visuals } = useEmptyState({
    category: 'empty-expected',
    severity: 'info',
    headline: 'No data yet',
    body: 'Share your funnel to start collecting analytics.',
    primaryAction: {
      label: 'Copy Funnel Link',
      onClick: () => console.log('Copy link to clipboard')
    }
  })
  
  return (
    <EmptyState 
      contract={contract} 
      visuals={visuals}
      icon={<BarChart3 className="w-16 h-16 text-gray-400" />}
    />
  )
}

/**
 * Example 4: Rate limit hit
 */
export function DashboardRateLimitError() {
  const { contract } = useEmptyState({
    category: 'recoverable-error',
    severity: 'warning',
    headline: 'Too many requests',
    body: 'You\'ve reached the limit for your plan. Upgrade to continue or wait until tomorrow.',
    primaryAction: {
      label: 'View Plans',
      onClick: () => console.log('Navigate to pricing')
    },
    secondaryAction: {
      label: 'Learn More',
      onClick: () => console.log('Open rate limit docs')
    }
  })
  
  return <RecoverableError contract={contract} />
}
