'use client'

import React, { useState } from 'react'
import { ArrowRight, Mail, CheckCircle } from 'lucide-react'

interface Step5ActivateEmailProps {
  funnelUrl?: string
  onEmailComplete: () => void
  onBack?: () => void
}

export default function Step5ActivateEmail({ funnelUrl, onEmailComplete, onBack }: Step5ActivateEmailProps) {
  const [hasActivated, setHasActivated] = useState(false)

  const handleActivate = () => {
    setHasActivated(true)
  }

  const handleConfirmActivated = () => {
    setHasActivated(true)
    setTimeout(() => {
      onEmailComplete()
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
          Built-in email automation is included and ready to enable.
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
        {onBack && (
          <button
            onClick={onBack}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
        )}
        <button
          onClick={handleActivate}
          className={`
            w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold transition-colors
            ${hasActivated
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }
          `}
        >
          {hasActivated ? <CheckCircle className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
          {hasActivated ? 'Email Automation Enabled' : 'Enable Built-In Email Automation'}
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
            "Enable Email First"
          )}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Trust Indicator */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-500">
          In-house email automation is secure and respects your privacy
        </p>
      </div>
    </div>
  )
}
