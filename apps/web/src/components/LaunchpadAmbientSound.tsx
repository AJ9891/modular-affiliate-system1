'use client'

import { usePathname } from 'next/navigation'
import { AmbientSound } from './AmbientSound'
import { useAmbientSoundPreference } from './AmbientSoundToggle'
import { useUIExpression } from '@/lib/brand-brain/useUIExpression'
import { resolveSoundBehavior, getSoundFilePath, type SoundContext } from '@/lib/brand-brain/sound-behavior'

/**
 * LaunchpadAmbientSound
 * 
 * Intelligent ambient sound manager that:
 * - Respects BrandBrain personality profiles
 * - Adapts to user context (page)
 * - Honors user preferences
 * - Never surprises visitors
 */
export function LaunchpadAmbientSound() {
  const pathname = usePathname()
  const ui = useUIExpression()
  const [userPreference] = useAmbientSoundPreference(true)

  // Determine context from pathname
  const context: SoundContext = getContextFromPathname(pathname)

  // Resolve sound behavior
  const sound = resolveSoundBehavior(ui, context, userPreference)

  // Get audio file
  const audioSrc = getSoundFilePath(sound.profile)

  // Don't render if no audio source
  if (!audioSrc) {
    return null
  }

  return (
    <AmbientSound
      enabled={sound.enabled}
      src={audioSrc}
      volume={sound.volume}
    />
  )
}

/**
 * Map pathname to sound context
 */
function getContextFromPathname(pathname: string): SoundContext {
  if (pathname === '/') return 'homepage'
  if (pathname.startsWith('/launchpad')) return 'launchpad'
  if (pathname.startsWith('/dashboard')) return 'dashboard'
  if (pathname.startsWith('/builder')) return 'builder'
  if (pathname.startsWith('/checkout')) return 'checkout'
  return 'other'
}
