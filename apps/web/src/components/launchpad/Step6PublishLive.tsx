'use client'

import React, { useState } from 'react'
import { ArrowRight, Rocket, AlertTriangle, ExternalLink } from 'lucide-react'

interface Step6PublishLiveProps {
  onNext: () => void
  funnelUrl?: string
}

export default function Step6PublishLive({ onNext, funnelUrl }: Step6PublishLiveProps) {
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  const handlePublish = async () => {
    if (!isConfirmed) return

    setIsPublishing(true)

    // Simulate publishing process
    setTimeout(() => {
      setIsPublishing(false)
      onNext()
    }, 2000)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🚀</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Publish & Go Live
        </h1>
      </div>

      {/* Warning Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-left">
            <p className="text-sm font-medium text-amber-900 mb-2">
              Publishing makes your funnel public.
            </p>
            <p className="text-sm text-amber-800">
              Once published, anyone with the link can access it. This action cannot be undone.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Checkbox */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900 mb-1">
              I understand this will create a public link
            </p>
            <p className="text-sm text-gray-600">
              My funnel will be accessible to anyone with the URL
            </p>
          </div>
        </label>
      </div>

      {/* Preview URL */}
      {funnelUrl && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">Your funnel will be available at:</p>
              <p className="text-sm text-blue-600 font-mono">{funnelUrl}</p>
            </div>
            <button className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm">
              <ExternalLink className="w-4 h-4" />
              Preview
            </button>
          </div>
        </div>
      )}

      {/* Publish Button */}
      <div className="flex justify-center">
        <button
          onClick={handlePublish}
          disabled={!isConfirmed || isPublishing}
          className={`
            inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold transition-colors
            ${isConfirmed && !isPublishing
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isPublishing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Publishing...
            </>
          ) : (
            <>
              <Rocket className="w-5 h-5" />
              Publish Funnel
            </>
          )}
        </button>
      </div>
    </div>
  )
}