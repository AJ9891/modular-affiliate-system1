'use client'

import { BrandModeKey, BRAND_MODES, useBrandMode } from '@/contexts/BrandModeContext'

interface PersonalitySelectorProps {
  compact?: boolean
}

export function PersonalitySelector({ compact = false }: PersonalitySelectorProps) {
  const { mode, setMode } = useBrandMode()

  const personalities = [
    {
      key: 'rocket' as BrandModeKey,
      label: 'Rocket Future',
      icon: '🚀',
      description: 'Confident, optimistic, momentum-driven',
      color: 'from-orange-500 to-red-500',
      buttonColor: 'bg-orange-500 hover:bg-orange-600',
    },
    {
      key: 'meltdown' as BrandModeKey,
      label: 'AI Meltdown',
      icon: '🤖',
      description: 'Tired AI, brutally honest, data-driven',
      color: 'from-cyan-500 to-blue-500',
      buttonColor: 'bg-cyan-500 hover:bg-cyan-600',
    },
    {
      key: 'antiguru' as BrandModeKey,
      label: 'Anti-Guru',
      icon: '⚡',
      description: 'Sarcastic, anti-hype, calls out BS',
      color: 'from-yellow-500 to-amber-500',
      buttonColor: 'bg-yellow-500 hover:bg-yellow-600',
    },
  ]

  if (compact) {
    return (
      <div className="flex gap-2">
        {personalities.map((p) => (
          <button
            key={p.key}
            onClick={() => setMode(p.key)}
            className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
              mode === p.key
                ? `${p.buttonColor} text-white shadow-lg`
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={p.description}
          >
            {p.icon} {p.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Your Voice</h3>
        <p className="text-sm text-gray-600">
          This personality influences how AI generates your copy and how your funnel feels
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {personalities.map((p) => (
          <button
            key={p.key}
            onClick={() => setMode(p.key)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              mode === p.key
                ? `border-blue-500 bg-blue-50`
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{p.icon}</span>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{p.label}</div>
                <div className="text-sm text-gray-600">{p.description}</div>
                <div className="mt-2 text-xs text-gray-500">
                  <strong>Voice:</strong> {BRAND_MODES[p.key].voice}
                </div>
              </div>
              {mode === p.key && (
                <div className="text-2xl">✓</div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
