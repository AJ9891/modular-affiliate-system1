'use client'

import React, { useState } from 'react'
import { ArrowRight, Mail, ExternalLink, CheckCircle } from 'lucide-react'

interface Step5ActivateEmailProps {
  onNext: () => void
}

export default function Step5ActivateEmail({ onNext }: Step5ActivateEmailProps) {
  const [hasActivated, setHasActivated] = useState(false)

  const handleActivate = () => {
    // Open SendShark affiliate link in new tab
    window.open('https://sendshark.com', '_blank')
  }

  const handleConfirmActivated = () => {
    setHasActivated(true)
    setTimeout(() => {
      onNext()
    }, 1000)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">📧</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Activate Email Follow-Up
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Funnels work better with follow-up.
          SendShark is included and activated through our partner link.
        </p>
      </div>

      {/* Explanation Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-left">
            <p className="text-sm font-medium text-blue-900 mb-2">
              Why email follow-up matters:
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Convert visitors who don't buy immediately</li>
              <li>• Build relationships with your audience</li>
              <li>• Increase lifetime customer value</li>
              <li>• Professional follow-up sequences included</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <button
          onClick={handleActivate}
          className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          <Mail className="w-5 h-5" />
          Activate SendShark Email
          <ExternalLink className="w-4 h-4" />
        </button>

        <button
          onClick={handleConfirmActivated}
          disabled={!hasActivated}
          className={`
            w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold transition-colors
            ${hasActivated
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
            }
          `}
        >
          {hasActivated ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Email Activated — Continue
            </>
          ) : (
            "I've Activated SendShark"
          )}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Trust Indicator */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-500">
          SendShark integration is secure and respects your privacy
        </p>
      </div>
    </div>
  )
}