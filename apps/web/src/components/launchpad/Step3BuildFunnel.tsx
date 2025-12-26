'use client'

import React, { useState } from 'react'
import { ArrowRight, Sparkles, FileText } from 'lucide-react'
import EnhancedFunnelBuilder from '@/components/EnhancedFunnelBuilder'

interface Step3BuildFunnelProps {
  onNext: () => void
  funnelId?: string
}

export default function Step3BuildFunnel({ onNext, funnelId }: Step3BuildFunnelProps) {
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = () => {
    setIsSaved(true)
    // In a real implementation, this would save the funnel
    setTimeout(() => {
      onNext()
    }, 1000)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Status Badge */}
      <div className="flex items-center justify-center mb-6">
        <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">
          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
          Draft — Private
        </div>
      </div>

      {/* Teaching Tooltip */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900 mb-1">
              Draft funnels are not public. Only you can see this.
            </p>
            <p className="text-sm text-blue-700">
              Focus on getting something good enough. You can always improve it later.
            </p>
          </div>
        </div>
      </div>

      {/* Funnel Builder */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Build Your Funnel</h2>
              <p className="text-sm text-gray-600 mt-1">
                Use templates, AI assistance, or start from scratch
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                <FileText className="w-4 h-4" />
                Templates
              </button>
              <button className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                <Sparkles className="w-4 h-4" />
                AI Assist
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <EnhancedFunnelBuilder
            initialNiche="general"
            funnelId={funnelId}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          disabled={isSaved}
          className={`
            inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors
            ${isSaved
              ? 'bg-green-600 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }
          `}
        >
          {isSaved ? 'Saved!' : 'Save & Continue'}
          {!isSaved && <ArrowRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  )
}