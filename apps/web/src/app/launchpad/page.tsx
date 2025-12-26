'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import LaunchProgressHeader from '@/components/LaunchProgressHeader'
import Step1MissionBriefing from '@/components/launchpad/Step1MissionBriefing'
import Step2ChooseObjective from '@/components/launchpad/Step2ChooseObjective'
import Step3BuildFunnel from '@/components/launchpad/Step3BuildFunnel'
import Step4PreviewTest from '@/components/launchpad/Step4PreviewTest'
import Step5ActivateEmail from '@/components/launchpad/Step5ActivateEmail'
import Step6PublishLive from '@/components/launchpad/Step6PublishLive'
import Step7Liftoff from '@/components/launchpad/Step7Liftoff'
import { Target, Users, DollarSign, TrendingUp, Plus, ArrowRight, CheckCircle, Sparkles, Zap, BarChart } from 'lucide-react'

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
  const searchParams = useSearchParams()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<number | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [setupComplete, setSetupComplete] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [userId, setUserId] = useState<string>('')
  const [selectedObjective, setSelectedObjective] = useState<string>('')
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
        .select('onboarding_step, max_launchpads, plan, email, is_admin, onboarding_seen')
        .eq('id', user.id)
        .single()

      if (!data) return

      setUserData(data)
      setUserProfile(data)
      setUserId(user.id)
      
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
      const onboardingStep = data.onboarding_step ?? STEPS.MISSION_BRIEFING
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

  const advanceStep = async (nextStep: number) => {
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
  }

  const handleMissionBriefingComplete = () => {
    advanceStep(STEPS.CHOOSE_OBJECTIVE)
  }

  const handleObjectiveSelect = (objective: string) => {
    setSelectedObjective(objective)
  }

  const handleObjectiveComplete = () => {
    advanceStep(STEPS.BUILD_FUNNEL)
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
    if (currentStep > STEPS.MISSION_BRIEFING) {
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
    // Main dashboard for returning users
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome Back! 🚀
            </h1>
            <p className="text-xl text-gray-600">
              Your affiliate empire is growing. Here&apos;s what&apos;s happening.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Active Funnels</span>
                <Target className="text-blue-500" size={24} />
              </div>
              <div className="text-3xl font-bold">{stats.funnels}</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Total Leads</span>
                <Users className="text-green-500" size={24} />
              </div>
              <div className="text-3xl font-bold">{(stats.leads ?? 0).toLocaleString()}</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Revenue</span>
                <DollarSign className="text-purple-500" size={24} />
              </div>
              <div className="text-3xl font-bold">${(stats.revenue ?? 0).toLocaleString()}</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Conversions</span>
                <TrendingUp className="text-orange-500" size={24} />
              </div>
              <div className="text-3xl font-bold">{stats.conversions}</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => {
                const ActionIcon = action.icon
                return (
                  <a
                    key={index}
                    href={action.href}
                    className={`
                      bg-gradient-to-br ${action.color} 
                      text-white rounded-xl shadow-lg p-6 
                      hover:shadow-2xl transition-all transform hover:-translate-y-1
                    `}
                  >
                    <ActionIcon className="mb-4" size={32} />
                    <h3 className="font-bold text-lg mb-2">{action.title}</h3>
                    <p className="text-sm opacity-90">{action.description}</p>
                  </a>
                )
              })}
            </div>
          </div>

          {/* Funnel Templates */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Start a New Funnel</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {funnelTemplates.map((template, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all cursor-pointer"
                >
                  <h3 className="font-bold text-lg mb-2">{template.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{template.blocks} blocks</span>
                    <span className="text-green-600 font-semibold">{template.conversions}</span>
                  </div>
                  <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                    Use Template <ArrowRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Onboarding for new users
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <LaunchProgressHeader
        currentStep={currentStep}
        completedSteps={completedSteps}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {currentStep === STEPS.MISSION_BRIEFING && (
          <Step1MissionBriefing onNext={handleMissionBriefingComplete} />
        )}

        {currentStep === STEPS.CHOOSE_OBJECTIVE && (
          <Step2ChooseObjective
            selectedObjective={selectedObjective}
            onObjectiveSelect={handleObjectiveSelect}
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
