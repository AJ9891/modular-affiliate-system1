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
      <div className="flex items-center justify-center min-h-screen bg-brand-navy launch-pad-premium">
        <div className="card-premium p-8 text-center">
          <div className="loading-premium h-12 w-12 rounded-full mx-auto mb-4"></div>
          <p className="body-premium">Preparing launch sequence...</p>
        </div>
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
    <div className="min-h-screen bg-brand-navy launch-pad-premium">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl heading-premium text-white mb-6">
            <Rocket className="inline-block mr-4 text-brand-orange glow-launch" size={48} />
            Affiliate Launchpad
          </h1>
          <p className="body-premium text-xl text-slate-300">Your guided path to affiliate success</p>
        </div>

        <div className="space-y-8">
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
        card-premium transition-all duration-300 relative overflow-hidden
        ${isActive ? 'glow-launch border-brand-orange/50 bg-gradient-to-r from-brand-orange/5 to-transparent' : ''}
        ${isComplete ? 'border-green-500/50 bg-gradient-to-r from-green-500/5 to-transparent' : ''}
        ${isPending ? 'opacity-60' : ''}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            {isComplete && <Check className="text-green-400 glow-cyan" size={28} />}
            {isActive && <Rocket className="text-brand-orange glow-launch" size={28} />}
            {isPending && <Lock className="text-slate-500" size={28} />}
            <h2 className="heading-premium text-3xl text-white">{title}</h2>
          </div>
          <p className="body-premium text-lg mb-6 text-slate-300">{description}</p>
          
          {isActive && !final && onAdvance && (
            <button
              onClick={onAdvance}
              className="btn-launch-premium"
            >
              {buttonText || 'Continue'}
            </button>
          )}

          {final && (
            <div className="card-premium bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 glow-cyan">
              <p className="text-green-300 font-semibold text-lg flex items-center gap-3">
                🎉 Launch Sequence Complete! Your affiliate system is ready.
              </p>
            </div>
          )}
        </div>

        <div className={`
          text-sm font-bold px-4 py-2 rounded-full backdrop-blur-sm
          ${isComplete ? 'bg-green-500/20 text-green-300 border border-green-500/30' : ''}
          ${isActive ? 'bg-brand-orange/20 text-brand-orange border border-brand-orange/30 glow-launch' : ''}
          ${isPending ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30' : ''}
        `}>
          Stage {stage}
        </div>
      </div>
    </section>
  )
}

function UpgradeLock() {
  return (
    <section className="card-premium bg-gradient-to-r from-brand-orange/5 to-brand-purple/5 border-brand-orange/30 glow-premium">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-brand-gradient rounded-full flex items-center justify-center glow-launch">
          <Lock className="text-white" size={32} />
        </div>
        <h2 className="heading-premium text-3xl text-white mb-4">Ignition Locked</h2>
        <p className="body-premium text-lg text-slate-300 mb-8">
          Starter authorization required to build and launch your funnels.
        </p>
        <a href="/pricing">
          <button className="btn-launch-premium inline-flex items-center gap-3">
            <Rocket size={20} />
            Authorize Launch
          </button>
        </a>
      </div>
    </section>
  )
}
