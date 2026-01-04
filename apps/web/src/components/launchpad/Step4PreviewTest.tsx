'use client'

import React, { useState } from 'react'
import { ArrowRight, Eye, ExternalLink, AlertCircle } from 'lucide-react'

interface Step4PreviewTestProps {
  funnelUrl?: string
  onTestComplete: () => void
  onBack?: () => void
}

export default function Step4PreviewTest({ funnelUrl, onTestComplete, onBack }: Step4PreviewTestProps) {
  const [hasTested, setHasTested] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  // Convert relative URL to absolute URL for iframe
  const getAbsoluteUrl = (url: string | undefined) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    // Use the current origin for relative URLs
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${url.startsWith('/') ? url : `/${url}`}`
    }
    return url
  }

  const absoluteFunnelUrl = getAbsoluteUrl(funnelUrl)

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Status Badge */}
      <div className="flex items-center justify-center mb-6">
        <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">
          <Eye className="w-4 h-4" />
          Preview Mode — Private
        </div>
      </div>

      {/* Banner */}
      <div className="bg-blue-600 text-white rounded-lg p-6 mb-8 text-center">
        <h2 className="text-xl font-semibold mb-2">
          This is exactly what visitors will see once you publish
        </h2>
        <p className="text-sm opacity-90">
          Click through it like a visitor would to make sure everything works.
        </p>
      </div>

      {/* Preview Area */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Funnel Preview</h3>
            {absoluteFunnelUrl && (
              <a
                href={absoluteFunnelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Open in New Tab
              </a>
            )}
          </div>
        </div>

        <div className="p-6">
          {absoluteFunnelUrl ? (
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-300 relative">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading preview...</p>
                  </div>
                </div>
              )}
              {loadError && (
                <div className="absolute inset-0 flex items-center justify-center bg-yellow-50 z-10">
                  <div className="text-center p-6">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
                    <p className="text-gray-900 font-medium mb-2">Preview couldn't load in the frame</p>
                    <p className="text-sm text-gray-600 mb-4">Click "Open in New Tab" above to view your funnel</p>
                    <a
                      href={absoluteFunnelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Funnel
                    </a>
                  </div>
                </div>
              )}
              <iframe
                src={absoluteFunnelUrl}
                className="w-full h-full"
                title="Funnel Preview"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false)
                  setLoadError(true)
                }}
              />
            </div>
          ) : (
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No funnel URL provided</p>
                <p className="text-sm mt-1">Please save your funnel first</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Testing Checklist */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Test Checklist</h3>
        <div className="space-y-3">
          {[
            'Content loads properly',
            'Links and buttons work',
            'Mobile layout looks good',
            'Call-to-action is clear'
          ].map((item, index) => (
            <label key={index} className="flex items-center gap-3">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                onChange={() => setHasTested(true)}
              />
              <span className="text-sm text-gray-700">{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
        )}
        <button
          onClick={onTestComplete}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors ml-auto"
        >
          Looks Good — Continue
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}