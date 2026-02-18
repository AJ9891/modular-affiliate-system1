'use client'

import React, { useEffect, useState } from 'react'
import { Target, Users, Lightbulb, ArrowRight, Activity } from 'lucide-react'

interface Step2ChooseObjectiveProps {
  onNext: (payload: { campaignName: string; funnelType: string; trafficGoal: string }) => void
  selectedObjective?: string
  initialCampaignName?: string
  initialFunnelType?: string
  initialTrafficGoal?: string
  onBack?: () => void
}

const FUNNEL_TYPES = [
  { id: 'lead-magnet', name: 'Lead Magnet', description: 'Capture emails with a free value' },
  { id: 'product-review', name: 'Product Review', description: 'Compare and recommend offers' },
  { id: 'vsl', name: 'Video Sales Letter', description: 'Sell with video-first storytelling' },
  { id: 'webinar', name: 'Webinar', description: 'Collect registrations for live/evergreen' }
]

const TRAFFIC_GOALS = [
  { id: 'grow-email', label: 'Grow email list' },
  { id: 'paid-traffic', label: 'Tune paid traffic' },
  { id: 'organic', label: 'Convert organic visitors' }
]

export default function Step2ChooseObjective({ onNext, selectedObjective, initialCampaignName, initialFunnelType, initialTrafficGoal, onBack }: Step2ChooseObjectiveProps) {
  const [campaignName, setCampaignName] = useState(initialCampaignName || '')
  const [funnelType, setFunnelType] = useState(initialFunnelType || selectedObjective || '')
  const [trafficGoal, setTrafficGoal] = useState(initialTrafficGoal || '')

  useEffect(() => {
    if (initialCampaignName || initialFunnelType || initialTrafficGoal) return
    if (typeof window === 'undefined') return
    const savedName = localStorage.getItem('launchpad_campaign_name') || ''
    const savedType = localStorage.getItem('launchpad_funnel_type') || ''
    const savedGoal = localStorage.getItem('launchpad_traffic_goal') || ''
    if (savedName) setCampaignName(savedName)
    if (savedType) setFunnelType(savedType)
    if (savedGoal) setTrafficGoal(savedGoal)
  }, [initialCampaignName, initialFunnelType, initialTrafficGoal])

  const handleNext = () => {
    if (!campaignName || !funnelType || !trafficGoal) return
    if (typeof window !== 'undefined') {
      localStorage.setItem('launchpad_campaign_name', campaignName)
      localStorage.setItem('launchpad_funnel_type', funnelType)
      localStorage.setItem('launchpad_traffic_goal', trafficGoal)
    }
    onNext({ campaignName, funnelType, trafficGoal })
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🎯</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Startup Checklist
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          Three quick steps to get you moving. Nothing goes live yet.
        </p>
        <p className="text-sm text-blue-600 font-semibold">Throttle: {`${Number(!!campaignName) + Number(!!funnelType) + Number(!!trafficGoal)}/3`} Completed</p>
      </div>

      <div className="space-y-6 mb-10">
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="text-blue-600" size={20} />
            <div>
              <p className="font-semibold text-gray-900">Name your campaign</p>
              <p className="text-sm text-gray-600">Helps label your funnel and reports.</p>
            </div>
          </div>
          <input
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="e.g., Spring Launch — Wellness Bundle"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Target className="text-green-600" size={20} />
            <div>
              <p className="font-semibold text-gray-900">Choose a funnel type</p>
              <p className="text-sm text-gray-600">We’ll preload structure and copy suggestions.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {FUNNEL_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => setFunnelType(type.id)}
                className={`text-left p-4 rounded-lg border transition-colors ${
                  funnelType === type.id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-semibold text-gray-900">{type.name}</p>
                <p className="text-sm text-gray-600">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Users className="text-purple-600" size={20} />
            <div>
              <p className="font-semibold text-gray-900">Set a traffic goal</p>
              <p className="text-sm text-gray-600">So we can highlight the right filters and reports.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {TRAFFIC_GOALS.map(goal => (
              <button
                key={goal.id}
                onClick={() => setTrafficGoal(goal.id)}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  trafficGoal === goal.id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-semibold text-gray-900 text-sm">{goal.label}</p>
              </button>
            ))}
          </div>
        </div>
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
          disabled={!campaignName || !funnelType || !trafficGoal}
          className={`
            inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-colors ml-auto
            ${campaignName && funnelType && trafficGoal
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          Throttle Up
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}