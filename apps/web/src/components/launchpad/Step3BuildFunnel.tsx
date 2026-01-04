'use client'

import React, { useState } from 'react'
import { ArrowRight, Sparkles, FileText } from 'lucide-react'
import EnhancedFunnelBuilder from '@/components/EnhancedFunnelBuilder'

interface Step3BuildFunnelProps {
  onFunnelComplete: (funnelUrl: string) => void
  selectedObjective?: string
  onBack?: () => void
  funnelId?: string | null
}

export default function Step3BuildFunnel({ onFunnelComplete, selectedObjective, onBack, funnelId }: Step3BuildFunnelProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [currentFunnelSlug, setCurrentFunnelSlug] = useState<string | null>(null)

  const handleFunnelSave = (funnelId: string, slug: string) => {
    setCurrentFunnelSlug(slug)
    setIsSaved(true)
    // Construct the actual funnel URL
    const funnelUrl = `/f/${slug}`
    onFunnelComplete(funnelUrl)
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
              Add blocks to your funnel, customize the content, then click the <strong>Save</strong> button in the builder below to continue.
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
            onSave={handleFunnelSave}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between mt-6">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
        )}
        {isSaved && (
          <button
            onClick={() => {}}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-green-600 text-white ml-auto cursor-default"
          >
            Funnel Saved! Continue to Preview
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}