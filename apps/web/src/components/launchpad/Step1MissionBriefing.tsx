'use client'

import React from 'react'
import { ArrowRight, MapPin } from 'lucide-react'

interface Step1MissionBriefingProps {
  onNext: () => void
}

export default function Step1MissionBriefing({ onNext }: Step1MissionBriefingProps) {
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

      <div className="flex justify-center">
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Begin Launch Sequence
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}