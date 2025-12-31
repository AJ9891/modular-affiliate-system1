/**
 * Ambient Sound Controller
 * 
 * One place, total control.
 * Centralized sound management that respects personality rules.
 * 
 * Key design decisions:
 * - Sound only fires when trigger changes
 * - No looping
 * - No persistence
 * - Silent failure (important for trust)
 */

'use client'

import { useEffect, useRef } from 'react'
import { usePersonality } from '@/lib/personality/PersonalityContext'
import { 
  resolveSoundBehavior, 
  shouldPlaySound,
  getSoundFilePath 
} from '@/lib/personality/soundBehavior'

/**
 * Sound trigger types
 * 
 * Each trigger represents a meaningful user action or system event
 */
export type SoundTrigger = 
  | 'step_complete'   // User completes a checklist step
  | 'step_unlocked'   // New content becomes available
  | 'system_ready'    // Page/feature loaded
  | 'error'           // Something went wrong
  | 'success'         // Action succeeded

/**
 * AmbientSoundController Props
 */
interface AmbientSoundControllerProps {
  trigger: SoundTrigger
  onPlayStart?: () => void
  onPlayEnd?: () => void
}

/**
 * AmbientSoundController Component
 * 
 * Plays sounds based on personality and triggers.
 * Returns null (invisible component).
 * 
 * Usage:
 * ```tsx
 * {behavior.allowAmbientSound && (
 *   <AmbientSoundController trigger="step_complete" />
 * )}
 * ```
 */
export function AmbientSoundController({ 
  trigger,
  onPlayStart,
  onPlayEnd
}: AmbientSoundControllerProps) {
  const { personality } = usePersonality()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Resolve sound behavior from personality
    const behavior = resolveSoundBehavior(personality)
    
    // Check if we should play sound for this trigger
    if (!behavior.enabled || !behavior.profile) {
      return
    }

    if (!shouldPlaySound(personality, trigger)) {
      return
    }

    // Get sound file path
    const soundPath = getSoundFilePath(behavior.profile)

    // Create audio element
    const audio = new Audio(soundPath)
    audio.volume = behavior.volume
    audioRef.current = audio

    // Optional callback
    if (onPlayStart) {
      onPlayStart()
    }

    // Attempt to play (silent fail)
    audio.play().catch((error) => {
      // Silent fail — no console noise, no UX penalty
      // Browsers block autoplay, and that's okay
      // We respect user preferences
    })

    // Cleanup callback
    audio.onended = () => {
      if (onPlayEnd) {
        onPlayEnd()
      }
    }

    // Cleanup on unmount or trigger change
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        audioRef.current = null
      }
    }
  }, [trigger, personality, onPlayStart, onPlayEnd])

  // This component renders nothing
  return null
}

/**
 * Hook: useAmbientSound
 * 
 * Programmatic sound control for use in components
 * 
 * Usage:
 * ```tsx
 * const { play } = useAmbientSound()
 * 
 * const handleSuccess = () => {
 *   play('success')
 * }
 * ```
 */
export function useAmbientSound() {
  const { personality } = usePersonality()

  const play = (trigger: SoundTrigger) => {
    const behavior = resolveSoundBehavior(personality)
    
    if (!behavior.enabled || !behavior.profile) {
      return
    }

    if (!shouldPlaySound(personality, trigger)) {
      return
    }

    const soundPath = getSoundFilePath(behavior.profile)
    const audio = new Audio(soundPath)
    audio.volume = behavior.volume

    audio.play().catch(() => {
      // Silent fail
    })
  }

  return { play }
}

/**
 * Example Usage Patterns
 * 
 * 1. Component-based (declarative)
 * ```tsx
 * function ChecklistItem() {
 *   const [completed, setCompleted] = useState(false)
 *   
 *   return (
 *     <>
 *       <button onClick={() => setCompleted(true)}>Complete</button>
 *       {completed && <AmbientSoundController trigger="step_complete" />}
 *     </>
 *   )
 * }
 * ```
 * 
 * 2. Hook-based (imperative)
 * ```tsx
 * function Form() {
 *   const { play } = useAmbientSound()
 *   
 *   const handleSubmit = async () => {
 *     try {
 *       await submitForm()
 *       play('success')
 *     } catch {
 *       play('error')
 *     }
 *   }
 *   
 *   return <form onSubmit={handleSubmit}>...</form>
 * }
 * ```
 * 
 * 3. Conditional rendering
 * ```tsx
 * function Hero() {
 *   const { personality } = usePersonality()
 *   const behavior = resolveSoundBehavior(personality)
 *   
 *   return (
 *     <section>
 *       <h1>Welcome</h1>
 *       {behavior.enabled && (
 *         <AmbientSoundController trigger="system_ready" />
 *       )}
 *     </section>
 *   )
 * }
 * ```
 */
