/**
 * Sound Integration Example
 * 
 * Real-world example showing how to integrate governed sound
 * into a Launchpad checklist component
 */

'use client'

import { useState } from 'react'
import { AmbientSoundController, useAmbientSound } from '@/components/sound'
import { usePersonality, resolveSoundBehavior } from '@/lib/personality'

/**
 * Example 1: Declarative Sound (Component-based)
 * 
 * Best for: Simple trigger-based sounds
 */
export function ChecklistItemDeclarative({ step }: { step: any }) {
  const [completed, setCompleted] = useState(false)
  
  return (
    <div className="flex items-center gap-3 p-4 border rounded">
      <input
        type="checkbox"
        checked={completed}
        onChange={() => setCompleted(true)}
        className="w-5 h-5"
      />
      <span className="flex-1">{step.title}</span>
      
      {/* Sound plays when completed, respecting personality */}
      {completed && (
        <AmbientSoundController trigger="step_complete" />
      )}
    </div>
  )
}

/**
 * Example 2: Imperative Sound (Hook-based)
 * 
 * Best for: Complex logic, async operations
 */
export function ChecklistItemImperative({ step }: { step: any }) {
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(false)
  const { play } = useAmbientSound()
  
  const handleComplete = async () => {
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setCompleted(true)
      play('step_complete')  // Play sound on success
      
    } catch (error) {
      play('error')  // Play error sound (if personality allows)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="flex items-center gap-3 p-4 border rounded">
      <input
        type="checkbox"
        checked={completed}
        onChange={handleComplete}
        disabled={loading}
        className="w-5 h-5"
      />
      <span className="flex-1">
        {step.title}
        {loading && ' (saving...)'}
      </span>
    </div>
  )
}

/**
 * Example 3: Conditional Sound (Based on Personality)
 * 
 * Best for: When you need to check sound behavior first
 */
export function ChecklistItemConditional({ step }: { step: any }) {
  const [completed, setCompleted] = useState(false)
  const { personality } = usePersonality()
  const soundBehavior = resolveSoundBehavior(personality)
  
  const handleComplete = () => {
    setCompleted(true)
    
    // Show visual feedback based on sound availability
    if (!soundBehavior.enabled) {
      // Show extra visual feedback when sound is disabled
      showToast('Step completed!')
    }
  }
  
  return (
    <div className="flex items-center gap-3 p-4 border rounded">
      <input
        type="checkbox"
        checked={completed}
        onChange={handleComplete}
        className="w-5 h-5"
      />
      <span className="flex-1">{step.title}</span>
      
      {completed && soundBehavior.enabled && (
        <AmbientSoundController trigger="step_complete" />
      )}
    </div>
  )
}

/**
 * Example 4: Complete Launchpad with Multiple Triggers
 */
export function LaunchpadChecklist({ steps }: { steps: any[] }) {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [unlockedSteps, setUnlockedSteps] = useState<Set<string>>(new Set())
  const { play } = useAmbientSound()
  
  const handleStepComplete = (stepId: string) => {
    const newCompleted = new Set(completedSteps)
    newCompleted.add(stepId)
    setCompletedSteps(newCompleted)
    
    // Play completion sound
    play('step_complete')
    
    // Check if this unlocks next step
    const nextStep = steps.find(s => s.previousStepId === stepId)
    if (nextStep && !unlockedSteps.has(nextStep.id)) {
      setTimeout(() => {
        setUnlockedSteps(prev => new Set(prev).add(nextStep.id))
        play('step_unlocked')  // Play unlock sound
      }, 500)
    }
    
    // Check if all steps complete
    if (newCompleted.size === steps.length) {
      setTimeout(() => {
        play('success')  // Play success sound
      }, 1000)
    }
  }
  
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold mb-4">Launch Checklist</h2>
      
      {steps.map(step => (
        <div
          key={step.id}
          className={`
            flex items-center gap-3 p-4 border rounded transition-all
            ${completedSteps.has(step.id) ? 'bg-green-50' : ''}
            ${unlockedSteps.has(step.id) ? 'animate-pulse' : ''}
          `}
        >
          <input
            type="checkbox"
            checked={completedSteps.has(step.id)}
            onChange={() => handleStepComplete(step.id)}
            className="w-5 h-5"
          />
          <span className="flex-1">{step.title}</span>
          
          {unlockedSteps.has(step.id) && (
            <span className="text-xs text-green-600">✨ Unlocked!</span>
          )}
        </div>
      ))}
      
      {completedSteps.size === steps.length && (
        <div className="p-4 bg-green-100 rounded text-center">
          🎉 All steps complete! Ready to launch.
        </div>
      )}
    </div>
  )
}

/**
 * Example 5: Hero with System Ready Sound
 */
export function HeroWithSound() {
  const { personality } = usePersonality()
  const soundBehavior = resolveSoundBehavior(personality)
  
  return (
    <section className="py-20 text-center">
      <h1 className="text-4xl font-bold mb-4">
        Welcome to Launchpad
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Your affiliate empire starts here.
      </p>
      
      {/* Play ambient sound when hero loads (if personality allows) */}
      {soundBehavior.enabled && (
        <AmbientSoundController 
          trigger="system_ready"
          onPlayStart={() => console.log('Hero ambient sound started')}
        />
      )}
      
      <button className="btn-primary">
        Get Started
      </button>
    </section>
  )
}

/**
 * Utility: Toast for silent mode
 */
function showToast(message: string) {
  // Your toast implementation
  console.log('Toast:', message)
}

/**
 * Example Usage in a Page
 */
export default function LaunchpadPage() {
  const steps = [
    { id: '1', title: 'Choose your niche', previousStepId: null },
    { id: '2', title: 'Add affiliate offers', previousStepId: '1' },
    { id: '3', title: 'Design your funnel', previousStepId: '2' },
    { id: '4', title: 'Connect your domain', previousStepId: '3' },
    { id: '5', title: 'Launch!', previousStepId: '4' }
  ]
  
  return (
    <div className="container mx-auto py-12">
      <LaunchpadChecklist steps={steps} />
    </div>
  )
}

/**
 * Key Takeaways:
 * 
 * 1. Sound is GOVERNED by personality, not forced
 * 2. Use <AmbientSoundController> for declarative approach
 * 3. Use useAmbientSound() for imperative approach
 * 4. Always check soundBehavior when you need fine control
 * 5. Sounds fail silently - no error handling needed
 * 6. Multiple triggers work together (complete → unlock → success)
 */
