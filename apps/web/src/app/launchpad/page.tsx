'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import LaunchProgressHeader from '@/components/LaunchProgressHeader'
import Step1MissionBriefing from '@/components/launchpad/Step1MissionBriefing'
import Step2ChooseObjective from '@/components/launchpad/Step2ChooseObjective'
import Step3BuildFunnel from '@/components/launchpad/Step3BuildFunnel'
import Step4PreviewTest from '@/components/launchpad/Step4PreviewTest'
import Step5ActivateEmail from '@/components/launchpad/Step5ActivateEmail'
import Step6PublishLive from '@/components/launchpad/Step6PublishLive'
import Step7Liftoff from '@/components/launchpad/Step7Liftoff'
import { AmbientSoundToggle } from '@/components/AmbientSoundToggle'
import { LaunchpadVision } from '@/components/LaunchpadVision'
import { DollarSign, Sparkles, Zap, BarChart, Brain } from 'lucide-react'

export const runtime = 'edge'

// Step mapping - single source of truth
const STEPS = {
  MISSION_BRIEFING: 1,
  CHOOSE_OBJECTIVE: 2,
  BUILD_FUNNEL: 3,
  PREVIEW_TEST: 4,
  ACTIVATE_EMAIL: 5,
  PUBLISH_LIVE: 6,
  LIFTOFF: 7,
  COMPLETE: 8,
} as const

/**
 * Affiliate Launchpad - Main Launch Dashboard
 * 
 * Combines the best features:
 * - Guided onboarding for new users
 * - Quick-start templates
 * - Real-time analytics dashboard
 * - One-click funnel creation
 * - AI-powered content generation
 */
export default function LaunchpadPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<number | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [setupComplete, setSetupComplete] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [userId, setUserId] = useState<string>('')
  const [intent, setIntent] = useState<string>('')
  const [selectedObjective, setSelectedObjective] = useState<string>('')
  const [campaignName, setCampaignName] = useState<string>('')
  const [trafficGoal, setTrafficGoal] = useState<string>('')
  const [onboardingId, setOnboardingId] = useState<string>('')
  const [funnelUrl, setFunnelUrl] = useState<string>('')
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [stats, setStats] = useState({
    funnels: 0,
    leads: 0,
    revenue: 0,
    conversions: 0
  })

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (!response.ok) {
        router.push('/login')
        return
      }

      const authData = await response.json()
      const user = authData.user

      const { data } = await supabase
        .from('users')
        .select('onboarding_step, max_launchpads, plan, email, is_admin, onboarding_seen, funnel_type')
        .eq('id', user.id)
        .single()

      if (!data) return

      setUserData(data)
      setUserProfile(data)
      setUserId(user.id)
      if (data.funnel_type) setSelectedObjective(data.funnel_type)

      // Load onboarding progress from dedicated table
      const { data: onboarding } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (onboarding) {
        setOnboardingId(onboarding.id)
        if (onboarding.intent) setIntent(onboarding.intent)
        if (onboarding.campaign_name) setCampaignName(onboarding.campaign_name)
        if (onboarding.funnel_type) setSelectedObjective(onboarding.funnel_type)
        if (onboarding.traffic_goal) setTrafficGoal(onboarding.traffic_goal)
      }
      
      console.log('User data:', data)
      console.log('Onboarding step:', data.onboarding_step, 'Max launchpads:', data.max_launchpads, 'Is admin:', data.is_admin)
      
      // Pro users with completed onboarding skip to dashboard
      if (data.max_launchpads > 1 && data.onboarding_step === STEPS.COMPLETE) {
        console.log('Redirecting pro user to dashboard')
        router.push('/dashboard')
        return
      }

      // Check capacity before allowing new launchpad
      const canCreate = data.is_admin || await canCreateLaunchpad(user.id, data.max_launchpads)
      console.log('Can create launchpad:', canCreate, 'Max:', data.max_launchpads, 'Is admin:', data.is_admin)
      
      // Allow access to launchpad for onboarding, but track if they can create
      const onboardingStep = onboarding?.current_step ?? data.onboarding_step ?? STEPS.MISSION_BRIEFING
      setCurrentStep(onboardingStep)
      setUserData({ ...data, canCreateLaunchpad: canCreate })

      // Load stats
      const statsResponse = await fetch('/api/analytics?range=30d')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats({
          funnels: statsData.totalFunnels || 0,
          leads: statsData.stats?.totalLeads || 0,
          revenue: statsData.stats?.totalRevenue || 0,
          conversions: statsData.stats?.totalConversions || 0
        })
      }
    } catch (error) {
      console.error('Failed to load user:', error)
    }
  }

  const canCreateLaunchpad = async (userId: string, maxLaunchpads: number) => {
    const { count } = await supabase
      .from('funnels')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('active', true)

    return (count || 0) < maxLaunchpads
  }

  const upsertOnboardingProgress = async (overrides?: Partial<{
    intent: string
    campaign_name: string
    funnel_type: string
    traffic_goal: string
    current_step: number
  }>) => {
    const { data: auth } = await supabase.auth.getUser()
    if (!auth?.user) return

    const resolvedIntent = overrides?.intent ?? intent
    const resolvedCampaign = overrides?.campaign_name ?? campaignName
    const resolvedFunnel = overrides?.funnel_type ?? selectedObjective
    const resolvedTraffic = overrides?.traffic_goal ?? trafficGoal
    const resolvedStep = overrides?.current_step ?? currentStep ?? STEPS.MISSION_BRIEFING

    const payload = {
      user_id: auth.user.id,
      intent: resolvedIntent,
      campaign_name: resolvedCampaign,
      funnel_type: resolvedFunnel,
      traffic_goal: resolvedTraffic,
      current_step: resolvedStep,
      checklist: {
        intent: !!resolvedIntent,
        campaign: !!resolvedCampaign,
        funnelType: !!resolvedFunnel,
        trafficGoal: !!resolvedTraffic,
      }
    }

    const { data: upserted, error } = await supabase
      .from('onboarding_progress')
      .upsert(payload, { onConflict: 'user_id' })
      .select('id')
      .single()

    if (!error && upserted?.id) {
      setOnboardingId(upserted.id)
    }
  }

  const advanceStep = async (nextStep: number, overrides?: Partial<{ intent: string; campaign_name: string; funnel_type: string; traffic_goal: string }>) => {
    if (!userData) return

    setCurrentStep(nextStep)
    if (currentStep !== null) {
      setCompletedSteps(prev => [...prev, currentStep].filter((step, index, arr) => arr.indexOf(step) === index))
    }

    const { data: auth } = await supabase.auth.getUser()
    if (!auth?.user) return

    await supabase
      .from('users')
      .update({ onboarding_step: nextStep })
      .eq('id', auth.user.id)

    await upsertOnboardingProgress({
      intent: overrides?.intent,
      campaign_name: overrides?.campaign_name,
      funnel_type: overrides?.funnel_type,
      traffic_goal: overrides?.traffic_goal,
      current_step: nextStep,
    })
  }

  const handleMissionIntent = async (intentValue: string) => {
    setIntent(intentValue)
    try {
      await upsertOnboardingProgress({ intent: intentValue })
    } catch (err) {
      console.warn('Optional intent persistence skipped:', err)
    }
    advanceStep(STEPS.CHOOSE_OBJECTIVE, { intent: intentValue })
  }

  const handleObjectiveComplete = async (payload: { campaignName: string; funnelType: string; trafficGoal: string }) => {
    setSelectedObjective(payload.funnelType)
    setCampaignName(payload.campaignName)
    setTrafficGoal(payload.trafficGoal)

    // Persist onboarding data if available
    try {
      await upsertOnboardingProgress({
        campaign_name: payload.campaignName,
        funnel_type: payload.funnelType,
        traffic_goal: payload.trafficGoal,
      })
    } catch (err) {
      console.warn('Optional onboarding persistence skipped:', err)
    }

    advanceStep(STEPS.BUILD_FUNNEL, {
      campaign_name: payload.campaignName,
      funnel_type: payload.funnelType,
      traffic_goal: payload.trafficGoal,
    })
  }

  const handleFunnelComplete = (funnelUrl: string) => {
    setFunnelUrl(funnelUrl)
    advanceStep(STEPS.PREVIEW_TEST)
  }

  const handleTestComplete = () => {
    advanceStep(STEPS.ACTIVATE_EMAIL)
  }

  const handleEmailComplete = () => {
    advanceStep(STEPS.PUBLISH_LIVE)
  }

  const handlePublishComplete = () => {
    advanceStep(STEPS.LIFTOFF)
  }

  const handleLiftoffComplete = () => {
    // Mark onboarding as complete
    advanceStep(STEPS.COMPLETE)
    setSetupComplete(true)
    router.push('/dashboard')
  }

  const handleStepClick = (stepNumber: number) => {
    // Allow navigation to completed steps or current step
    if ((currentStep !== null && stepNumber <= currentStep) || completedSteps.includes(stepNumber)) {
      setCurrentStep(stepNumber)
    }
  }

  const handleBack = () => {
    if (currentStep !== null && currentStep > STEPS.MISSION_BRIEFING) {
      advanceStep(currentStep - 1)
    }
  }

  // Prevent flicker and step-jumping
  if (currentStep === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5714]"></div>
      </div>
    )
  }

  const quickActions = [
    {
      title: 'Visual Funnel Builder',
      description: 'Drag-and-drop interface with pre-built blocks',
      icon: Sparkles,
      color: 'from-blue-500 to-blue-600',
      href: '/visual-builder'
    },
    {
      title: 'AI Content Generator',
      description: 'Let AI create your landing pages and emails',
      icon: Zap,
      color: 'from-purple-500 to-purple-600',
      href: '/ai-generator'
    },
    {
      title: 'Analytics Dashboard',
      description: 'Track leads, conversions, and revenue',
      icon: BarChart,
      color: 'from-green-500 to-green-600',
      href: '/dashboard'
    },
    {
      title: 'AI Optimizer',
      description: 'Auto-optimize funnels with AI suggestions',
      icon: Brain,
      color: 'from-gradient-purple to-gradient-pink',
      href: '/ai-optimizer'
    },
    {
      title: 'Manage Offers',
      description: 'Add and organize affiliate products',
      icon: DollarSign,
      color: 'from-orange-500 to-orange-600',
      href: '/offers'
    }
  ]

  const funnelTemplates = [
    {
      name: 'Lead Magnet',
      description: 'Capture emails with a free download',
      blocks: 3,
      conversions: '18-25%',
      category: 'lead-gen'
    },
    {
      name: 'Product Review',
      description: 'Review and recommend affiliate products',
      blocks: 5,
      conversions: '8-15%',
      category: 'review'
    },
    {
      name: 'Video Sales Letter',
      description: 'Video-first landing page',
      blocks: 4,
      conversions: '12-20%',
      category: 'vsl'
    },
    {
      name: 'Webinar Registration',
      description: 'Collect registrations for live training',
      blocks: 4,
      conversions: '25-35%',
      category: 'webinar'
    }
  ]

  if (setupComplete || stats.funnels > 0) {
    const visionStats = [
      { label: 'Active Funnels', value: stats.funnels.toString() },
      { label: 'Leads', value: (stats.leads ?? 0).toLocaleString() },
      { label: 'Revenue', value: `$${(stats.revenue ?? 0).toLocaleString()}` },
      { label: 'Conversions', value: stats.conversions.toString() },
    ]

    const visionActions = quickActions.map((action) => ({
      title: action.title,
      description: action.description,
      href: action.href,
      icon: action.icon,
      accent: 'cyan' as const,
    }))

    return (
      <div className="relative">
        <div className="absolute right-6 top-6 z-20">
          <AmbientSoundToggle defaultEnabled={true} />
        </div>
        <LaunchpadVision stats={visionStats} actions={visionActions} userPlan={userData?.plan} />
      </div>
    )
  }

  // Onboarding for new users
  return (
    <div className="theme-launch">
      <LaunchProgressHeader
        currentStep={currentStep}
        completedSteps={completedSteps}
      />

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="card-surface rounded-2xl border border-white/10 p-5 text-sm text-amber-100/90">
          <p className="font-semibold text-white flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/80 text-xs">🚀</span>
            Rocket is your launch personality for onboarding.
          </p>
          <p className="mt-1 text-amber-100/80">
            Guidance stays supportive and momentum-focused until you reach orbit.
          </p>
        </div>
        {currentStep === STEPS.MISSION_BRIEFING && (
          <Step1MissionBriefing onComplete={handleMissionIntent} initialIntent={intent} />
        )}

        {currentStep === STEPS.CHOOSE_OBJECTIVE && (
          <Step2ChooseObjective
            selectedObjective={selectedObjective}
            initialCampaignName={campaignName}
            initialFunnelType={selectedObjective}
            initialTrafficGoal={trafficGoal}
            onNext={handleObjectiveComplete}
            onBack={handleBack}
          />
        )}

        {currentStep === STEPS.BUILD_FUNNEL && (
          <Step3BuildFunnel
            selectedObjective={selectedObjective}
            onFunnelComplete={handleFunnelComplete}
            onBack={handleBack}
          />
        )}

        {currentStep === STEPS.PREVIEW_TEST && (
          <Step4PreviewTest
            funnelUrl={funnelUrl}
            onTestComplete={handleTestComplete}
            onBack={handleBack}
          />
        )}

        {currentStep === STEPS.ACTIVATE_EMAIL && (
          <Step5ActivateEmail
            funnelUrl={funnelUrl}
            onEmailComplete={handleEmailComplete}
            onBack={handleBack}
          />
        )}

        {currentStep === STEPS.PUBLISH_LIVE && (
          <Step6PublishLive
            funnelUrl={funnelUrl}
            onPublishComplete={handlePublishComplete}
            onBack={handleBack}
          />
        )}

        {currentStep === STEPS.LIFTOFF && (
          <Step7Liftoff
            funnelUrl={funnelUrl}
            onComplete={handleLiftoffComplete}
          />
        )}
      </div>
    </div>
  )
}
