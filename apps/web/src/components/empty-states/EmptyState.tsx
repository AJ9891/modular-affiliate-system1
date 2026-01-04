/**
 * Empty State Component
 * 
 * For empty-but-expected and empty-but-unexpected states
 * Personality bandwidth: full to reduced
 */

'use client'

import React from 'react'
import { EmptyStateContract, EmptyStateVisuals } from '@/lib/empty-states/types'

interface EmptyStateProps {
  contract: EmptyStateContract
  visuals: EmptyStateVisuals
  icon?: React.ReactNode
}

export function EmptyState({ contract, visuals, icon }: EmptyStateProps) {
  const { headline, body, primaryAction, secondaryAction } = contract
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-6 py-12 text-center">
      {/* Icon */}
      {icon && (
        <div 
          className={`mb-6 ${
            visuals.iconStyle === 'animated' && visuals.motionIntensity === 'subtle' ? 'animate-pulse' : ''
          } ${
            visuals.iconStyle === 'animated' && visuals.motionIntensity === 'medium' ? 'animate-bounce' : ''
          }`}
        >
          {icon}
        </div>
      )}
      
      {/* Headline - this is where personality lives */}
      <h3 className="text-xl font-semibold mb-3 text-gray-900">
        {headline}
      </h3>
      
      {/* Body - always neutral tone */}
      {body && (
        <p className="text-sm text-gray-600 max-w-md mb-8">
          {body}
        </p>
      )}
      
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {primaryAction && (
          <button
            onClick={primaryAction.onClick}
            className="px-6 py-2.5 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
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
    </div>
  )
}
