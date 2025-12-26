'use client'

import React from 'react'
import { CheckCircle, Lock, MapPin } from 'lucide-react'

interface LaunchProgressHeaderProps {
  currentStep: number
  completedSteps: number[]
}

const STEPS = [
  { id: 1, name: 'Mission Briefing', icon: '🛰' },
  { id: 2, name: 'Objective', icon: '🎯' },
  { id: 3, name: 'Funnel', icon: '🛠' },
  { id: 4, name: 'Preview', icon: '👁' },
  { id: 5, name: 'Email', icon: '📧' },
  { id: 6, name: 'Publish', icon: '🚀' },
  { id: 7, name: 'Liftoff', icon: '🧑‍🚀' }
]

export default function LaunchProgressHeader({ currentStep, completedSteps }: LaunchProgressHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">🧭</span>
            Launch Progress
          </h1>
          <div className="text-sm text-gray-500">
            Step {currentStep} of {STEPS.length}
          </div>
        </div>

        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id)
            const isCurrent = step.id === currentStep
            const isFuture = step.id > currentStep

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-medium
                    ${isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isCurrent
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : isFuture ? (
                      <Lock className="w-4 h-4" />
                    ) : isCurrent ? (
                      <MapPin className="w-4 h-4" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div className="text-xs text-center mt-1 max-w-16">
                    <div className={`font-medium ${
                      isCompleted ? 'text-green-600' :
                      isCurrent ? 'text-blue-600' :
                      'text-gray-400'
                    }`}>
                      {step.name}
                    </div>
                  </div>
                </div>

                {index < STEPS.length - 1 && (
                  <div className={`
                    flex-1 h-0.5 mx-2 mt-[-20px]
                    ${completedSteps.includes(step.id) && completedSteps.includes(STEPS[index + 1].id)
                      ? 'bg-green-500'
                      : completedSteps.includes(step.id)
                        ? 'bg-blue-500'
                        : 'bg-gray-200'
                    }
                  `} />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
}