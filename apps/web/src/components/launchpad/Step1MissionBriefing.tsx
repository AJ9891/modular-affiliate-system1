'use client'

import React, { useEffect, useState } from 'react'
import { ArrowRight, MapPin } from 'lucide-react'

interface Step1MissionBriefingProps {
  onComplete: (intent: string) => void
  initialIntent?: string
}

const INTENTS = [
  { id: 'create-funnel', label: 'Create my first funnel' },
  { id: 'import-traffic', label: 'Import traffic data' },
  { id: 'setup-email', label: 'Set up email automation' }
]

export default function Step1MissionBriefing({ onComplete, initialIntent }: Step1MissionBriefingProps) {
  const [intent, setIntent] = useState(initialIntent || '')

  useEffect(() => {
    if (initialIntent) return
    const saved = typeof window !== 'undefined' ? localStorage.getItem('launchpad_intent') : null
    if (saved) setIntent(saved)
  }, [initialIntent])

  const handleNext = () => {
    if (!intent) return
    if (typeof window !== 'undefined') {
      localStorage.setItem('launchpad_intent', intent)
    }
    onComplete(intent)
  }
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🛰</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Launchpad
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          This process will guide you step-by-step to a live funnel.
          Nothing goes public until you say so.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-blue-900 mb-1">
                A funnel is a simple path: page → action → follow-up.
              </p>
              <p className="text-sm text-blue-700">
                We'll build this together, one step at a time.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">What brings you here?</h2>
        <p className="text-sm text-gray-600 mb-4">Pick the closest intent. We’ll tailor the next steps.</p>
        <div className="space-y-3">
          {INTENTS.map(option => (
            <label
              key={option.id}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                intent === option.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="intent"
                value={option.id}
                checked={intent === option.id}
                onChange={() => setIntent(option.id)}
                className="h-4 w-4 text-blue-600"
              />
              <span className="text-gray-800">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleNext}
          disabled={!intent}
          className={`inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-colors ${
            intent ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Begin Launch Sequence
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}