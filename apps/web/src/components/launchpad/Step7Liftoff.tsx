'use client'

import React, { useEffect } from 'react'
import { CheckCircle, ExternalLink, BarChart3, Edit, Users } from 'lucide-react'

interface Step7LiftoffProps {
  funnelUrl: string
  onComplete?: () => void
  onViewAnalytics?: () => void
  onEditFunnel?: () => void
}

export default function Step7Liftoff({ funnelUrl, onComplete, onViewAnalytics, onEditFunnel }: Step7LiftoffProps) {
  useEffect(() => {
    if (onComplete) {
      // Auto-complete after a short delay to show the success message
      const timer = setTimeout(() => {
        onComplete()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [onComplete])
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🧑‍🚀</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Liftoff Complete! 🚀
        </h1>
      </div>

      {/* Success Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <span className="text-lg font-semibold text-green-900">Funnel is live</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-green-200">
            <span className="text-sm text-green-800">Status</span>
            <span className="text-sm font-medium text-green-900">Published & Live</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-green-800">Public URL</span>
            <a
              href={funnelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {funnelUrl}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Test in Incognito */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Test in incognito
        </h3>
        <p className="text-sm text-blue-800 mb-4">
          Open your funnel in a private/incognito window to see exactly what visitors see.
        </p>
        <a
          href={funnelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Test in New Window
        </a>
      </div>

      {/* Next Steps */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 text-center mb-4">
          What's next?
        </h3>

        <div className="grid gap-3">
          <button
            onClick={onViewAnalytics}
            className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left"
          >
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">View Analytics</div>
              <div className="text-sm text-gray-600">Track visits, conversions, and performance</div>
            </div>
          </button>

          <button
            onClick={onEditFunnel}
            className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left"
          >
            <Edit className="w-5 h-5 text-green-600" />
            <div>
              <div className="font-medium text-gray-900">Improve Copy</div>
              <div className="text-sm text-gray-600">Edit headlines, descriptions, and calls-to-action</div>
            </div>
          </button>

          <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg text-left">
            <Users className="w-5 h-5 text-purple-600" />
            <div>
              <div className="font-medium text-gray-900">Add Traffic</div>
              <div className="text-sm text-gray-600">Share your funnel link and drive visitors</div>
            </div>
          </div>
        </div>
      </div>

      {/* Gentle Close */}
      <div className="text-center mt-8">
        <p className="text-sm text-gray-600">
          Your funnel is live and ready to convert visitors into customers! 🎉
        </p>
      </div>
    </div>
  )
}