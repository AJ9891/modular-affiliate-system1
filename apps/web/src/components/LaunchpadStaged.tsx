'use client'

import { useEffect, useState } from 'react'
import { LAUNCHPAD_STAGES } from '@/config/launchpadStages'
import { useLaunchpad } from '@/hooks/useLaunchpad'
import { useAuth } from '@/contexts/AuthContext'
import { Rocket, Check, Lock } from 'lucide-react'

export default function LaunchpadStaged() {
  const { user } = useAuth()
  const { getProfile, updateStage } = useLaunchpad(user?.id)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      getProfile()
        .then(setProfile)
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [user?.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5714]"></div>
      </div>
    )
  }

  if (!profile) return null

  const requiresStarter =
    profile.launchpad_stage >= LAUNCHPAD_STAGES.IGNITION &&
    profile.plan !== 'starter'

  const advance = async () => {
    const next = profile.launchpad_stage + 1
    await updateStage(next)
    setProfile({ ...profile, launchpad_stage: next })
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#011936] mb-4">
          <Rocket className="inline-block mr-3" size={40} />
          Affiliate Launchpad
        </h1>
        <p className="text-gray-600">Your guided path to affiliate success</p>
      </div>

      <div className="space-y-6">
        {/* Stage 1: Ground Control */}
        {profile.launchpad_stage >= 1 && (
          <StageCard
            title="Ground Control"
            description="Review system fundamentals and setup"
            stage={1}
            currentStage={profile.launchpad_stage}
            onAdvance={advance}
            buttonText="System Reviewed"
          />
        )}

        {/* Stage 2: Pre-Flight Check */}
        {profile.launchpad_stage >= 2 && (
          <StageCard
            title="Pre-Flight Check"
            description="Complete essential configurations and checks"
            stage={2}
            currentStage={profile.launchpad_stage}
            onAdvance={advance}
            buttonText="Checks Complete"
          />
        )}

        {/* Stage 3: Ignition (May require upgrade) */}
        {requiresStarter ? (
          <UpgradeLock />
        ) : (
          profile.launchpad_stage >= 3 && (
            <StageCard
              title="Ignition"
              description="Build your first funnel and prepare for launch"
              stage={3}
              currentStage={profile.launchpad_stage}
              onAdvance={advance}
              buttonText="Funnel Built"
            />
          )
        )}

        {/* Stage 4: Lift-Off */}
        {!requiresStarter && profile.launchpad_stage >= 4 && (
          <StageCard
            title="Lift-Off"
            description="Your launch URL will activate once tracking is connected"
            stage={4}
            currentStage={profile.launchpad_stage}
            final={true}
          />
        )}
      </div>
    </div>
  )
}

interface StageCardProps {
  title: string
  description: string
  stage: number
  currentStage: number
  onAdvance?: () => void
  buttonText?: string
  final?: boolean
}

function StageCard({ 
  title, 
  description, 
  stage, 
  currentStage, 
  onAdvance, 
  buttonText,
  final = false 
}: StageCardProps) {
  const isActive = stage === currentStage
  const isComplete = stage < currentStage
  const isPending = stage > currentStage

  return (
    <section
      className={`
        border-2 rounded-lg p-6 transition-all
        ${isActive ? 'border-[#FF5714] bg-orange-50 shadow-lg' : ''}
        ${isComplete ? 'border-green-500 bg-green-50' : ''}
        ${isPending ? 'border-gray-300 bg-gray-50 opacity-60' : ''}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {isComplete && <Check className="text-green-600" size={24} />}
            {isActive && <Rocket className="text-[#FF5714]" size={24} />}
            <h2 className="text-2xl font-semibold text-[#011936]">{title}</h2>
          </div>
          <p className="text-gray-700 mb-4">{description}</p>
          
          {isActive && !final && onAdvance && (
            <button
              onClick={onAdvance}
              className="bg-[#FF5714] hover:bg-[#e04d10] text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              {buttonText || 'Continue'}
            </button>
          )}

          {final && (
            <div className="bg-green-100 border border-green-400 rounded-lg p-4 mt-4">
              <p className="text-green-800 font-medium">
                🎉 Launch Sequence Complete! Your affiliate system is ready.
              </p>
            </div>
          )}
        </div>

        <div className={`
          text-sm font-bold px-3 py-1 rounded-full
          ${isComplete ? 'bg-green-600 text-white' : ''}
          ${isActive ? 'bg-[#FF5714] text-white' : ''}
          ${isPending ? 'bg-gray-400 text-white' : ''}
        `}>
          Stage {stage}
        </div>
      </div>
    </section>
  )
}

function UpgradeLock() {
  return (
    <section className="border-2 border-[#FF5714] rounded-lg p-8 bg-gradient-to-r from-orange-50 to-purple-50 shadow-lg">
      <div className="text-center">
        <Lock className="mx-auto mb-4 text-[#FF5714]" size={48} />
        <h2 className="text-2xl font-semibold text-[#011936] mb-3">Ignition Locked</h2>
        <p className="text-gray-700 mb-6">
          Starter authorization required to build and launch your funnels.
        </p>
        <a href="/pricing">
          <button className="bg-[#FF5714] hover:bg-[#e04d10] text-white font-semibold py-3 px-8 rounded-lg transition-colors inline-flex items-center gap-2">
            <Rocket size={20} />
            Authorize Launch
          </button>
        </a>
      </div>
    </section>
  )
}
