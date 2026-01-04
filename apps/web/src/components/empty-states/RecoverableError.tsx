/**
 * Recoverable Error Component
 * 
 * For validation errors, rate limits, partial failures
 * Personality bandwidth: minimal
 * Always neutral tone, static icon, no motion
 */

'use client'

import React from 'react'
import { EmptyStateContract } from '@/lib/empty-states/types'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface RecoverableErrorProps {
  contract: EmptyStateContract
  showIcon?: boolean
}

export function RecoverableError({ contract, showIcon = true }: RecoverableErrorProps) {
  const { headline, body, primaryAction, secondaryAction } = contract
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] px-6 py-8 text-center">
      {/* Icon - always static for errors */}
      {showIcon && (
        <div className="mb-4">
          <AlertTriangle className="w-12 h-12 text-yellow-500" />
        </div>
      )}
      
      {/* Headline - neutral only */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {headline}
      </h3>
      
      {/* Body - clear explanation */}
      {body && (
        <p className="text-sm text-gray-600 max-w-md mb-6">
          {body}
        </p>
      )}
      
      {/* Actions - clear recovery path */}
      <div className="flex flex-col sm:flex-row gap-3">
        {primaryAction && (
          <button
            onClick={primaryAction.onClick}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {primaryAction.label}
          </button>
        )}
        
        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="px-5 py-2 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  )
}
