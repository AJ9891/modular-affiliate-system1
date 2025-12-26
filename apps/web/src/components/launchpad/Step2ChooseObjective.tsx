'use client'

import React, { useState } from 'react'
import { Target, Users, Lightbulb, ArrowRight } from 'lucide-react'

interface Step2ChooseObjectiveProps {
  onNext: (objective: string) => void
  selectedObjective?: string
  onBack?: () => void
}

const OBJECTIVES = [
  {
    id: 'promote-offer',
    name: 'Promote an offer',
    description: 'Drive sales for a product or service',
    icon: Target,
    color: 'bg-green-500'
  },
  {
    id: 'capture-leads',
    name: 'Capture leads',
    description: 'Build an email list for future marketing',
    icon: Users,
    color: 'bg-blue-500'
  },
  {
    id: 'test-idea',
    name: 'Test an idea',
    description: 'Validate a concept before full investment',
    icon: Lightbulb,
    color: 'bg-purple-500'
  }
]

export default function Step2ChooseObjective({ onNext, selectedObjective, onBack }: Step2ChooseObjectiveProps) {
  const [selected, setSelected] = useState(selectedObjective || '')

  const handleNext = () => {
    if (selected) {
      onNext(selected)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🎯</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          What's this funnel for?
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          Your choice helps tailor copy, structure, and tracking.
        </p>
        <p className="text-sm text-gray-500">
          You can change this later if needed.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {OBJECTIVES.map((objective) => {
          const Icon = objective.icon
          const isSelected = selected === objective.id

          return (
            <button
              key={objective.id}
              onClick={() => setSelected(objective.id)}
              className={`
                p-6 rounded-lg border-2 text-left transition-all
                ${isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${objective.color} text-white mb-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {objective.name}
              </h3>
              <p className="text-sm text-gray-600">
                {objective.description}
              </p>
            </button>
          )
        })}
      </div>

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
          onClick={handleNext}
          disabled={!selected}
          className={`
            inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-colors ml-auto
            ${selected
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          Lock Objective
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}