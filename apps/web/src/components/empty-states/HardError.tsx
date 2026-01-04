/**
 * Hard Error Component
 * 
 * For auth failures, 500s, corrupted state
 * Personality bandwidth: none
 * Always neutral, no personality, pure clarity and containment
 */

'use client'

import React from 'react'
import { EmptyStateContract } from '@/lib/empty-states/types'
import { XCircle } from 'lucide-react'

interface HardErrorProps {
  contract: EmptyStateContract
  showIcon?: boolean
}

export function HardError({ contract, showIcon = true }: HardErrorProps) {
  const { headline, body, primaryAction, secondaryAction } = contract
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-6 py-12 text-center">
      {/* Icon - always static, no animation */}
      {showIcon && (
        <div className="mb-6">
          <XCircle className="w-16 h-16 text-red-500" />
        </div>
      )}
      
      {/* Headline - no personality, just facts */}
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        {headline}
      </h3>
      
      {/* Body - clear, calm explanation */}
      {body && (
        <p className="text-sm text-gray-600 max-w-md mb-8 leading-relaxed">
          {body}
        </p>
      )}
      
      {/* Actions - clear next steps */}
      <div className="flex flex-col sm:flex-row gap-3">
        {primaryAction && (
          <button
            onClick={primaryAction.onClick}
            className="px-6 py-2.5 rounded-lg font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
          >
            {primaryAction.label}
          </button>
        )}
        
        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="px-6 py-2.5 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {secondaryAction.label}
          </button>
        )}
      </div>
      
      {/* Optional: Error details for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-8 text-left max-w-2xl w-full">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
            Technical details
          </summary>
          <pre className="mt-2 p-4 bg-gray-50 rounded text-xs text-gray-700 overflow-auto">
            {JSON.stringify(contract, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}
