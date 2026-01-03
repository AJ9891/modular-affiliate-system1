'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'launchpad_ambient_sound_enabled'

type AmbientSoundToggleProps = {
  className?: string
  defaultEnabled?: boolean
  onChange?: (enabled: boolean) => void
}

export function AmbientSoundToggle({ 
  className = '', 
  defaultEnabled = true,
  onChange 
}: AmbientSoundToggleProps) {
  const [enabled, setEnabled] = useState<boolean>(defaultEnabled)
  const [mounted, setMounted] = useState(false)

  // Load preference from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      const value = stored === 'true'
      setEnabled(value)
      onChange?.(value)
    } else {
      // First time user - set default
      localStorage.setItem(STORAGE_KEY, String(defaultEnabled))
      onChange?.(defaultEnabled)
    }
  }, [defaultEnabled, onChange])

  const handleToggle = () => {
    const newValue = !enabled
    setEnabled(newValue)
    localStorage.setItem(STORAGE_KEY, String(newValue))
    onChange?.(newValue)
  }

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
        enabled 
          ? 'bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/20' 
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      } ${className}`}
      aria-label={enabled ? 'Disable ambient sound' : 'Enable ambient sound'}
    >
      <span className="text-sm">
        {enabled ? '🔊' : '🔇'}
      </span>
      <span className="text-sm font-medium">
        Ambient launch audio
      </span>
    </button>
  )
}

/**
 * Hook to get current sound preference
 */
export function useAmbientSoundPreference(defaultEnabled: boolean = true): [boolean | null, (enabled: boolean) => void] {
  const [enabled, setEnabled] = useState<boolean | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      setEnabled(stored === 'true')
    } else {
      setEnabled(defaultEnabled)
      localStorage.setItem(STORAGE_KEY, String(defaultEnabled))
    }
  }, [defaultEnabled])

  const updatePreference = (newValue: boolean) => {
    setEnabled(newValue)
    localStorage.setItem(STORAGE_KEY, String(newValue))
  }

  return [enabled, updatePreference]
}
