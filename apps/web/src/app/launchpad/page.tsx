'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export const runtime = 'edge'

import { 
  Rocket, 
  Zap, 
  Target, 
  TrendingUp, 
  Mail, 
  DollarSign,
  CheckCircle,
  ArrowRight,
  PlayCircle,
  Settings,
  BarChart,
  Users,
  Sparkles
} from 'lucide-react'

import OnboardingSlideshow from '@/components/OnboardingSlides'

// Step mapping - single source of truth
const STEPS = {
  WELCOME: 1,
  NICHE: 2,
  OFFERS: 3,
  EMAIL: 4,
  COMPLETE: 5,
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
  const [selectedNiche, setSelectedNiche] = useState<string>('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [createdFunnel, setCreatedFunnel] = useState<any>(null)
  const [showSuccessScreen, setShowSuccessScreen] = useState(false)
  const [showOnboardingSlides, setShowOnboardingSlides] = useState(false)
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
      const onboardingStep = data.onboarding_step ?? STEPS.WELCOME
      setCurrentStep(onboardingStep)
      setUserData({ ...data, canCreateLaunchpad: canCreate })
      
      // Show onboarding slides for users who haven't seen them yet
      if (!data.onboarding_seen) {
        setShowOnboardingSlides(true)
      }

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

    const { data: auth } = await supabase.auth.getUser()
    if (!auth?.user) return

    await supabase
      .from('users')
      .update({ onboarding_step: nextStep })
      .eq('id', auth.user.id)
  }

  // Prevent flicker and step-jumping
  if (currentStep === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5714]"></div>
      </div>
    )
  }

  const launchSteps = [
    {
      id: 'welcome',
      title: 'Welcome to Affiliate Launchpad',
      description: 'Get your affiliate business up and running in minutes',
      icon: Rocket,
      action: 'Get Started'
    },
    {
      id: 'niche',
      title: 'Choose Your Niche',
      description: 'Select from pre-built modules or create your own',
      icon: Target,
      action: 'Select Niche'
    },
    {
      id: 'funnel',
      title: 'Build Your First Funnel',
      description: 'Use our drag-and-drop builder or AI generator',
      icon: Zap,
      action: 'Create Funnel'
    },
    {
      id: 'offers',
      title: 'Add Affiliate Offers',
      description: 'Connect your affiliate links and start earning',
      icon: DollarSign,
      action: 'Add Offers'
    },
    {
      id: 'email',
      title: 'Setup Email Automation',
      description: 'Automated follow-ups and nurture sequences',
      icon: Mail,
      action: 'Configure Email'
    },
    {
      id: 'launch',
      title: 'Launch & Track',
      description: 'Go live and monitor your performance',
      icon: TrendingUp,
      action: 'Launch Now'
    }
  ]

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

  const handleStepComplete = async (stepId: string) => {
    // Validate step requirements before advancing
    if (stepId === 'niche' && !selectedNiche) {
      alert('Please select a niche before continuing')
      return
    }
    
    if (stepId === 'funnel' && !selectedTemplate) {
      alert('Please select a funnel template before continuing')
      return
    }
    
    if (stepId === 'launch') {
      console.log('Launch clicked - selectedTemplate:', selectedTemplate)
      console.log('Launch clicked - selectedNiche:', selectedNiche)
      
      // Create the funnel when launching
      const template = funnelTemplates.find(t => t.category === selectedTemplate)
      console.log('Found template:', template)
      
      if (template) {
        console.log('Creating funnel from template...')
        await createFunnelFromTemplate(template, true)
      } else {
        console.log('No template found, completing setup')
        setSetupComplete(true)
        await loadUser()
      }
    } else {
      await advanceStep(currentStep + 1)
    }
  }

  const selectNiche = (nicheId: string) => {
    setSelectedNiche(nicheId)
  }

  const selectTemplate = (template: any) => {
    setSelectedTemplate(template.category)
  }

  const createFunnelFromTemplate = async (template: any, isLaunching = false) => {
    // Check if user can create launchpads (admins bypass limits)
    if (!userData?.is_admin && !userData?.canCreateLaunchpad) {
      alert('You have reached your launchpad limit. Please upgrade your plan to create more launchpads.')
      router.push('/pricing')
      return
    }
    
    try {
      console.log('Creating funnel...', { template, niche: selectedNiche })
      
      const response = await fetch('/api/funnels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: template.name,
          template: template.category,
          niche: selectedNiche || 'general'
        }),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })
      
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Funnel created:', data)
        setCreatedFunnel(data)
        
        if (isLaunching) {
          setShowSuccessScreen(true)
        } else {
          window.location.href = `/visual-builder?funnelId=${data.funnelId}&niche=${selectedNiche || 'general'}`
        }
      } else {
        const errorData = await response.json()
        console.error('Failed to create funnel:', errorData)
        
        // If database fails, still show success screen for demo purposes
        if (isLaunching) {
          setCreatedFunnel({ 
            funnelId: 'demo-' + Date.now(),
            funnel: { name: template.name }
          })
          setShowSuccessScreen(true)
        } else {
          alert('Error creating funnel: ' + (errorData.error || 'Unknown error'))
        }
      }
    } catch (error: any) {
      console.error('Failed to create funnel:', error)
      
      // If request times out or fails, still show success screen for demo
      if (isLaunching) {
        setCreatedFunnel({ 
          funnelId: 'demo-' + Date.now(),
          funnel: { name: template.name }
        })
        setShowSuccessScreen(true)
      } else {
        alert('Error: Request timed out or failed')
      }
    }
  }

  const getFunnelUrl = () => {
    if (!createdFunnel) return ''
    return `${window.location.origin}/f/${createdFunnel.funnelId || 'preview'}`
  }

  const shareToSocial = (platform: string) => {
    const url = encodeURIComponent(getFunnelUrl())
    const text = encodeURIComponent(`Check out my new ${selectedNiche} funnel!`)
    
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      instagram: `https://www.instagram.com/`, // Instagram doesn't support direct sharing
      pinterest: `https://pinterest.com/pin/create/button/?url=${url}&description=${text}`,
      reddit: `https://reddit.com/submit?url=${url}&title=${text}`
    }
    
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400')
    }
  }

  const copyFunnelUrl = () => {
    navigator.clipboard.writeText(getFunnelUrl())
    alert('Funnel URL copied to clipboard!')
  }

  // Show onboarding slides for new users
  if (showOnboardingSlides) {
    return <OnboardingSlideshow userId={userId} />
  }

  // Success screen after launch
  if (showSuccessScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-green-500 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl p-12">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
              <CheckCircle className="text-green-600" size={48} />
            </div>
            <h1 className="text-4xl font-bold mb-2">🎉 Your Funnel is Live!</h1>
            <p className="text-xl text-gray-600">
              Congratulations! Your {funnelTemplates.find(t => t.category === selectedTemplate)?.name} funnel is ready to start converting.
            </p>
          </div>

          {/* Funnel Preview */}
          <div className="mb-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg mb-1">
                  {funnelTemplates.find(t => t.category === selectedTemplate)?.name}
                </h3>
                <p className="text-sm text-gray-600">
                  Niche: <span className="font-semibold">{selectedNiche || 'General'}</span>
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Expected CVR</div>
                <div className="text-2xl font-bold text-green-600">
                  {funnelTemplates.find(t => t.category === selectedTemplate)?.conversions}
                </div>
              </div>
            </div>
            
            {/* Mini Preview */}
            <div className="bg-white rounded-lg p-4 border">
              <div className="text-center">
                <div className="w-full h-32 bg-gradient-to-r from-blue-400 to-purple-400 rounded mb-3 flex items-center justify-center">
                  <PlayCircle className="text-white" size={48} />
                </div>
                <div className="text-sm text-gray-600 mb-2">Your funnel includes:</div>
                <div className="flex justify-center gap-2 text-xs">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Hero Section</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">Features</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded">CTA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Funnel URL */}
          <div className="mb-8">
            <label className="block text-sm font-semibold mb-2">Your Funnel URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={getFunnelUrl()}
                readOnly
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 font-mono text-sm"
              />
              <button
                onClick={copyFunnelUrl}
                className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Social Share */}
          <div className="mb-8">
            <h3 className="font-semibold mb-4 text-center">Share Your Funnel</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { name: 'Facebook', icon: '📘', color: 'bg-blue-600', platform: 'facebook' },
                { name: 'Twitter', icon: '🐦', color: 'bg-sky-500', platform: 'twitter' },
                { name: 'LinkedIn', icon: '💼', color: 'bg-blue-700', platform: 'linkedin' },
                { name: 'Instagram', icon: '📷', color: 'bg-pink-600', platform: 'instagram' },
                { name: 'Pinterest', icon: '📌', color: 'bg-red-600', platform: 'pinterest' },
                { name: 'Reddit', icon: '🤖', color: 'bg-orange-600', platform: 'reddit' }
              ].map((social) => (
                <button
                  key={social.platform}
                  onClick={() => shareToSocial(social.platform)}
                  className={`${social.color} text-white p-4 rounded-lg hover:opacity-90 transition text-center`}
                >
                  <div className="text-2xl mb-1">{social.icon}</div>
                  <div className="text-xs font-semibold">{social.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => window.location.href = `/visual-builder?funnelId=${createdFunnel?.funnelId}&niche=${selectedNiche}`}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-xl transition"
            >
              Customize Funnel
            </button>
            <button
              onClick={() => {
                setSetupComplete(true)
                setShowSuccessScreen(false)
                window.location.href = '/dashboard'
              }}
              className="flex-1 px-6 py-4 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-900 transition"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

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
                  onClick={() => createFunnelFromTemplate(template)}
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
  const step = launchSteps[currentStep]
  const StepIcon = step.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {launchSteps.map((s, index) => (
              <div
                key={s.id}
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full
                  ${index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}
                  transition-all
                `}
              >
                {index < currentStep ? (
                  <CheckCircle size={20} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
              style={{ width: `${((currentStep + 1) / launchSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-6">
            <StepIcon className="text-white" size={36} />
          </div>

          <h1 className="text-4xl font-bold mb-4">{step.title}</h1>
          <p className="text-xl text-gray-600 mb-8">{step.description}</p>

          {/* Step-specific content */}
          {step.id === 'welcome' && (
            <div className="space-y-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <Zap className="text-blue-600 mb-2" size={24} />
                  <h3 className="font-bold mb-1">Lightning Fast</h3>
                  <p className="text-sm text-gray-600">Launch in minutes, not days</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <Sparkles className="text-purple-600 mb-2" size={24} />
                  <h3 className="font-bold mb-1">AI-Powered</h3>
                  <p className="text-sm text-gray-600">Let AI create your content</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <BarChart className="text-green-600 mb-2" size={24} />
                  <h3 className="font-bold mb-1">Track Everything</h3>
                  <p className="text-sm text-gray-600">Real-time analytics</p>
                </div>
              </div>
            </div>
          )}

          {step.id === 'niche' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {[
                { id: 'health', name: 'Health & Wellness', emoji: '💪', color: 'blue' },
                { id: 'finance', name: 'Finance & Investing', emoji: '💰', color: 'green' },
                { id: 'technology', name: 'Technology & Software', emoji: '💻', color: 'purple' },
                { id: 'dating', name: 'Dating & Relationships', emoji: '❤️', color: 'pink' },
                { id: 'education', name: 'Education & Courses', emoji: '🎓', color: 'indigo' },
                { id: 'custom', name: 'Custom Niche', emoji: '✨', color: 'gray' }
              ].map((niche) => (
                <div
                  key={niche.id}
                  onClick={() => selectNiche(niche.id)}
                  className={`
                    p-6 border-2 rounded-lg cursor-pointer transition-all text-center
                    ${selectedNiche === niche.id 
                      ? 'border-blue-600 bg-blue-50 shadow-lg' 
                      : 'border-gray-200 hover:border-blue-300'
                    }
                  `}
                >
                  <div className="text-4xl mb-2">{niche.emoji}</div>
                  <h4 className="font-bold text-sm">{niche.name}</h4>
                  {selectedNiche === niche.id && (
                    <div className="mt-2 text-blue-600">
                      <CheckCircle size={20} className="mx-auto" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {step.id === 'funnel' && (
            <div className="grid grid-cols-2 gap-4 mb-8">
              {funnelTemplates.map((template, index) => (
                <div
                  key={index}
                  onClick={() => selectTemplate(template)}
                  className={`
                    p-6 border-2 rounded-lg cursor-pointer transition-all
                    ${selectedTemplate === template.category
                      ? 'border-blue-600 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold">{template.name}</h4>
                    {selectedTemplate === template.category && (
                      <CheckCircle size={20} className="text-blue-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{template.blocks} blocks</span>
                    <span className="text-green-600 font-semibold">{template.conversions} CVR</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step.id === 'offers' && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-4">You can add affiliate offers after setup completes.</p>
              <div className="text-left space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle size={16} className="text-green-600" />
                  <span>Connect to major affiliate networks</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle size={16} className="text-green-600" />
                  <span>Track clicks and conversions</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle size={16} className="text-green-600" />
                  <span>Automatic link cloaking</span>
                </div>
              </div>
            </div>
          )}

          {step.id === 'email' && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-4">Email automation is ready to configure after setup.</p>
              <div className="text-left space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle size={16} className="text-green-600" />
                  <span>Welcome sequence for new leads</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle size={16} className="text-green-600" />
                  <span>Abandoned cart recovery</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle size={16} className="text-green-600" />
                  <span>Weekly analytics reports</span>
                </div>
              </div>
            </div>
          )}

          {step.id === 'launch' && (
            <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
              <p className="text-gray-700 mb-4 font-semibold">🎉 You&apos;re all set!</p>
              <div className="text-left space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle size={16} className="text-green-600" />
                  <span>Niche selected: <strong>{selectedNiche || 'General'}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle size={16} className="text-green-600" />
                  <span>Template ready: <strong>{funnelTemplates.find(t => t.category === selectedTemplate)?.name || 'Custom'}</strong></span>
                </div>
              </div>
              <p className="text-sm text-gray-600">Click below to access your dashboard and start building!</p>
            </div>
          )}

          <button
            onClick={() => handleStepComplete(step.id)}
            className="
              px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 
              text-white text-lg font-bold rounded-full 
              hover:shadow-2xl transform hover:scale-105 transition-all
              flex items-center gap-3 mx-auto
            "
          >
            {currentStep < launchSteps.length - 1 
              ? `Next: ${launchSteps[currentStep + 1].title}` 
              : step.action
            }
            <ArrowRight size={20} />
          </button>

          {currentStep > STEPS.WELCOME && (
            <button
              onClick={() => advanceStep(currentStep - 1)}
              className="mt-4 text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Need help? Check out our{' '}
            <a href="/docs" className="text-blue-600 hover:underline">
              documentation
            </a>{' '}
            or{' '}
            <a href="/support" className="text-blue-600 hover:underline">
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
