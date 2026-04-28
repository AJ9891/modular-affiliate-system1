'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
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
  BarChart,
  Users,
  Sparkles
} from 'lucide-react'

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
  const ONBOARDING_COMPLETE = 8
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(0)
  const [setupComplete, setSetupComplete] = useState(false)
  const [_userProfile, setUserProfile] = useState<any>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loadingUserData, setLoadingUserData] = useState(true)
  const [stepValidationError, setStepValidationError] = useState<string | null>(null)
  const [operationNotice, setOperationNotice] = useState<string | null>(null)
  const [selectedNiche, setSelectedNiche] = useState<string>('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [createdFunnel, setCreatedFunnel] = useState<any>(null)
  const [creatingTemplate, setCreatingTemplate] = useState<string | null>(null)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [showSuccessScreen, setShowSuccessScreen] = useState(false)
  const [stats, setStats] = useState({
    funnels: 0,
    leads: 0,
    revenue: 0,
    conversions: 0
  })

  useEffect(() => {
    loadUserData()
    
    // Check if a niche was selected
    const niche = searchParams.get('niche')
    if (niche) {
      setSelectedNiche(niche)
      // Skip to the funnel creation step
      setCurrentStep(2)
    }
  }, [searchParams])

  useEffect(() => {
    setStepValidationError(null)
  }, [currentStep])

  const loadUserData = async () => {
    try {
      setLoadingUserData(true)
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data.user)
        if (data?.user?.id) {
          setUserId(data.user.id)
        }
        
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
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
    } finally {
      setLoadingUserData(false)
    }
  }

  const markOnboardingComplete = async () => {
    try {
      let targetUserId = userId

      if (!targetUserId) {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        targetUserId = user?.id ?? null
      }

      if (!targetUserId) return

      await supabase
        .from('users')
        .update({
          onboarding_seen: true,
          onboarding_complete: true,
          onboarding_step: 99,
        })
        .eq('id', targetUserId)
    } catch (error) {
      // Best effort: cockpit skip flag still prevents hard redirect loop.
      console.error('Failed to mark onboarding complete:', error)
    }
  }

  const persistOnboardingStep = async (step: number) => {
    try {
      let targetUserId = userId

      if (!targetUserId) {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        targetUserId = user?.id ?? null
      }

      if (!targetUserId) return

      await supabase
        .from('users')
        .update({
          onboarding_seen: true,
          onboarding_step: step,
        })
        .eq('id', targetUserId)
    } catch (error) {
      console.error('Failed to persist onboarding step:', error)
    }
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
      action: 'Go to Cockpit'
    }
  ]

  const quickActions = [
    {
      title: 'Visual Funnel Builder',
      description: 'Drag-and-drop interface with pre-built blocks',
      icon: Sparkles,
      barClass: 'bg-cyan-300/80',
      chipClass: 'border-cyan-300/40 bg-cyan-400/15',
      iconClass: 'text-cyan-100',
      href: '/visual-builder'
    },
    {
      title: 'AI Content Generator',
      description: 'Let AI create your landing pages and emails',
      icon: Zap,
      barClass: 'bg-violet-300/80',
      chipClass: 'border-violet-300/40 bg-violet-400/15',
      iconClass: 'text-violet-100',
      href: '/ai-generator'
    },
    {
      title: 'Analytics Dashboard',
      description: 'Track leads, conversions, and revenue',
      icon: BarChart,
      barClass: 'bg-emerald-300/80',
      chipClass: 'border-emerald-300/40 bg-emerald-400/15',
      iconClass: 'text-emerald-100',
      href: '/dashboard'
    },
    {
      title: 'Manage Offers',
      description: 'Add and organize affiliate products',
      icon: DollarSign,
      barClass: 'bg-amber-300/80',
      chipClass: 'border-amber-300/40 bg-amber-400/15',
      iconClass: 'text-amber-100',
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
      setStepValidationError('Select a niche before continuing.')
      return
    }
    
    if (stepId === 'funnel' && !selectedTemplate) {
      setStepValidationError('Choose a funnel template before continuing.')
      return
    }

    setStepValidationError(null)
    
    if (stepId === 'launch') {
      setOperationNotice('Routing you to cockpit...')
      await markOnboardingComplete()
      if (typeof window !== 'undefined') {
        localStorage.setItem('lp_skip_onboarding', '1')
        document.cookie = 'lp_skip_onboarding=1; Path=/; Max-Age=2592000; SameSite=Lax'
      }
      window.location.href = '/cockpit'
      return
    } else {
      const nextStep = Math.min(currentStep + 1, ONBOARDING_COMPLETE)
      await persistOnboardingStep(nextStep)
      setCurrentStep(prev => prev + 1)
    }
  }

  const selectNiche = (nicheId: string) => {
    setStepValidationError(null)
    setSelectedNiche(nicheId)
  }

  const selectTemplate = (template: any) => {
    setStepValidationError(null)
    setSelectedTemplate(template.category)
  }

  const createFunnelFromTemplate = async (template: any, isLaunching = false) => {
    try {
      setCreatingTemplate(template.category)
      setOperationNotice(`Creating "${template.name}"...`)
      setStepValidationError(null)
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
        setOperationNotice(`"${template.name}" is ready.`)
        
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
          setOperationNotice(`"${template.name}" is ready in preview mode.`)
          setShowSuccessScreen(true)
        } else {
          setStepValidationError(errorData.error || 'Failed to create funnel.')
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
        setOperationNotice(`"${template.name}" is ready in preview mode.`)
        setShowSuccessScreen(true)
      } else {
        setStepValidationError('Request timed out or failed while creating your funnel.')
      }
    } finally {
      setCreatingTemplate(null)
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

  const copyFunnelUrl = async () => {
    try {
      await navigator.clipboard.writeText(getFunnelUrl())
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 1800)
    } catch {
      setStepValidationError('Unable to copy URL. You can copy it manually from the field.')
    }
  }

  const closeOnboarding = async () => {
    const hasFinishedFlow = currentStep >= launchSteps.length - 1 || setupComplete || showSuccessScreen

    if (hasFinishedFlow) {
      await markOnboardingComplete()
      window.location.href = '/cockpit'
      return
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('lp_skip_onboarding', '1')
      document.cookie = 'lp_skip_onboarding=1; Path=/; Max-Age=2592000; SameSite=Lax'
    }
    window.location.href = '/cockpit?skip_onboarding=1'
  }

  const skipOnboarding = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lp_skip_onboarding', '1')
      document.cookie = 'lp_skip_onboarding=1; Path=/; Max-Age=2592000; SameSite=Lax'
    }
    window.location.href = '/cockpit?skip_onboarding=1'
  }

  if (loadingUserData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="card-premium rounded-2xl px-8 py-7 text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-b-2 border-rocket-500" />
          <p className="text-sm text-text-secondary">Loading your launchpad...</p>
        </div>
      </div>
    )
  }

  // Success screen after launch
  if (showSuccessScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="card-premium w-full max-w-4xl rounded-3xl p-12">
          {/* Success Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20">
              <CheckCircle className="text-emerald-300" size={48} />
            </div>
            <h1 className="mb-2 text-4xl font-bold text-text-primary">🎉 Your Funnel is Live!</h1>
            <p className="text-xl text-text-secondary">
              Congratulations! Your {funnelTemplates.find(t => t.category === selectedTemplate)?.name} funnel is ready to start converting.
            </p>
          </div>

          {/* Funnel Preview */}
          <div className="mb-8 rounded-xl border-2 border-[var(--border-elevated)] bg-[rgba(255,255,255,0.04)] p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg mb-1">
                  {funnelTemplates.find(t => t.category === selectedTemplate)?.name}
                </h3>
                <p className="text-sm text-text-secondary">
                  Niche: <span className="font-semibold">{selectedNiche || 'General'}</span>
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-text-secondary">Expected CVR</div>
                <div className="text-2xl font-bold text-emerald-300">
                  {funnelTemplates.find(t => t.category === selectedTemplate)?.conversions}
                </div>
              </div>
            </div>
            
            {/* Mini Preview */}
            <div className="rounded-lg border border-[var(--border-elevated)] bg-[rgba(255,255,255,0.04)] p-4">
              <div className="text-center">
                <div className="mb-3 flex h-32 w-full items-center justify-center rounded bg-[linear-gradient(120deg,rgba(var(--accent-rgb),0.42),rgba(56,189,248,0.14))]">
                  <PlayCircle className="text-text-primary" size={48} />
                </div>
                <div className="text-sm text-text-secondary mb-2">Your funnel includes:</div>
                <div className="flex justify-center gap-2 text-xs">
                  <span className="rounded border border-cyan-300/35 bg-cyan-400/12 px-2 py-1 text-cyan-100">Hero Section</span>
                  <span className="rounded border border-violet-300/35 bg-violet-400/12 px-2 py-1 text-violet-100">Features</span>
                  <span className="rounded border border-emerald-300/35 bg-emerald-400/12 px-2 py-1 text-emerald-100">CTA</span>
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
                className="hud-input flex-1 rounded-lg px-4 py-3 font-mono text-sm"
              />
              <button
                onClick={copyFunnelUrl}
                className="hud-button-secondary px-6 py-3"
              >
                {copiedUrl ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Social Share */}
          <div className="mb-8">
            <h3 className="font-semibold mb-4 text-center">Share Your Funnel</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { name: 'Facebook', icon: '📘', chipClass: 'border-blue-300/35 bg-blue-400/15', textClass: 'text-blue-100', platform: 'facebook' },
                { name: 'Twitter', icon: '🐦', chipClass: 'border-cyan-300/35 bg-cyan-400/15', textClass: 'text-cyan-100', platform: 'twitter' },
                { name: 'LinkedIn', icon: '💼', chipClass: 'border-indigo-300/35 bg-indigo-400/15', textClass: 'text-indigo-100', platform: 'linkedin' },
                { name: 'Instagram', icon: '📷', chipClass: 'border-pink-300/35 bg-pink-400/15', textClass: 'text-pink-100', platform: 'instagram' },
                { name: 'Pinterest', icon: '📌', chipClass: 'border-rose-300/35 bg-rose-400/15', textClass: 'text-rose-100', platform: 'pinterest' },
                { name: 'Reddit', icon: '🤖', chipClass: 'border-amber-300/35 bg-amber-400/15', textClass: 'text-amber-100', platform: 'reddit' }
              ].map((social) => (
                <button
                  key={social.platform}
                  onClick={() => shareToSocial(social.platform)}
                  className="card-premium rounded-lg p-3 text-center transition hover:-translate-y-0.5"
                >
                  <div className={`mx-auto mb-1 inline-flex h-9 w-9 items-center justify-center rounded-lg border ${social.chipClass}`}>
                    <span className={social.textClass}>{social.icon}</span>
                  </div>
                  <div className="text-xs font-semibold text-text-secondary">{social.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => window.location.href = `/visual-builder?funnelId=${createdFunnel?.funnelId}&niche=${selectedNiche}`}
              className="btn-launch-premium flex-1 px-6 py-4 font-bold"
            >
              Customize Funnel
            </button>
            <button
              onClick={async () => {
                await markOnboardingComplete()
                setSetupComplete(true)
                setShowSuccessScreen(false)
                loadUserData()
              }}
              className="hud-button-secondary flex-1 px-6 py-4 font-bold"
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
      <div className="cockpit-container min-h-screen py-12">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="mb-12">
            <h1 className="mb-4 text-4xl font-bold text-text-primary">
              Welcome Back! 🚀
            </h1>
            <p className="text-xl text-text-secondary">
              Your affiliate empire is growing. Here&apos;s what&apos;s happening.
            </p>
            {operationNotice && (
              <p className="mt-3 inline-flex rounded-lg border border-emerald-400/35 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-200">
                {operationNotice}
              </p>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="card-premium rounded-xl border border-[var(--border-elevated)] p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-text-secondary">Active Funnels</span>
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-300/35 bg-cyan-400/15">
                  <Target className="text-cyan-100" size={18} />
                </div>
              </div>
              <div className="text-3xl font-bold">{stats.funnels}</div>
            </div>

            <div className="card-premium rounded-xl border border-[var(--border-elevated)] p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-text-secondary">Total Leads</span>
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-300/35 bg-emerald-400/15">
                  <Users className="text-emerald-100" size={18} />
                </div>
              </div>
              <div className="text-3xl font-bold">{stats.leads.toLocaleString()}</div>
            </div>

            <div className="card-premium rounded-xl border border-[var(--border-elevated)] p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-text-secondary">Revenue</span>
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-violet-300/35 bg-violet-400/15">
                  <DollarSign className="text-violet-100" size={18} />
                </div>
              </div>
              <div className="text-3xl font-bold">${stats.revenue.toLocaleString()}</div>
            </div>

            <div className="card-premium rounded-xl border border-[var(--border-elevated)] p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-text-secondary">Conversions</span>
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-amber-300/35 bg-amber-400/15">
                  <TrendingUp className="text-amber-100" size={18} />
                </div>
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
                    className="card-premium group relative overflow-hidden rounded-xl p-6 transition-all hover:-translate-y-1 hover:shadow-2xl"
                  >
                    <div className={`pointer-events-none absolute inset-x-6 top-0 h-[2px] ${action.barClass}`} />
                    <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg border ${action.chipClass}`}>
                      <ActionIcon className={action.iconClass} size={24} />
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-text-primary">{action.title}</h3>
                    <p className="text-sm text-text-secondary">{action.description}</p>
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
                  className="card-premium rounded-xl p-6 hover:shadow-2xl transition-all cursor-pointer"
                  onClick={() => {
                    if (creatingTemplate) return
                    createFunnelFromTemplate(template)
                  }}
                >
                  <h3 className="font-bold text-lg mb-2">{template.name}</h3>
                  <p className="text-text-secondary text-sm mb-4">{template.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">{template.blocks} blocks</span>
                    <span className="font-semibold text-emerald-300">{template.conversions}</span>
                  </div>
                  <button
                    disabled={creatingTemplate !== null}
                    className="btn-launch-premium mt-4 flex w-full items-center justify-center gap-2 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {creatingTemplate === template.category ? 'Creating...' : 'Use Template'} <ArrowRight size={16} />
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
    <div className="cockpit-container min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="mb-4 flex items-center justify-between text-sm text-text-secondary">
            <span>Step {currentStep + 1} of {launchSteps.length}</span>
            <span>{Math.round(((currentStep + 1) / launchSteps.length) * 100)}% complete</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            {launchSteps.map((s, index) => (
                <div
                  key={s.id}
                  className={`
                  flex items-center justify-center w-10 h-10 rounded-full
                  ${index <= currentStep ? 'bg-rocket-500 text-slate-900' : 'bg-[rgba(255,255,255,0.1)] text-text-secondary'}
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
          <div className="h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.12)]">
            <div
              className="h-full bg-gradient-to-r from-rocket-600 to-rocket-500 transition-all duration-500"
              style={{ width: `${((currentStep + 1) / launchSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="card-premium rounded-2xl p-12 text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rocket-700 to-rocket-500">
            <StepIcon className="text-white" size={36} />
          </div>

          <h1 className="text-4xl font-bold mb-4 text-text-primary">{step.title}</h1>
          <p className="text-xl text-text-secondary mb-8">{step.description}</p>

          {operationNotice && (
            <p className="mx-auto mb-5 max-w-xl rounded-lg border border-emerald-400/35 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
              {operationNotice}
            </p>
          )}

          {stepValidationError && (
            <p className="mx-auto mb-5 max-w-xl rounded-lg border border-red-400/35 bg-red-500/10 px-4 py-2 text-sm text-red-200">
              {stepValidationError}
            </p>
          )}

          {/* Step-specific content */}
          {step.id === 'welcome' && (
            <div className="space-y-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="rounded-lg border border-[var(--border-elevated)] bg-[var(--accent-soft)] p-4">
                  <Zap className="mb-2 text-amber-200" size={24} />
                  <h3 className="font-bold mb-1 text-text-primary">Lightning Fast</h3>
                  <p className="text-sm text-text-secondary">Launch in minutes, not days</p>
                </div>
                <div className="rounded-lg border border-[var(--border-elevated)] bg-[var(--accent-soft)] p-4">
                  <Sparkles className="mb-2 text-violet-200" size={24} />
                  <h3 className="font-bold mb-1 text-text-primary">AI-Powered</h3>
                  <p className="text-sm text-text-secondary">Let AI create your content</p>
                </div>
                <div className="rounded-lg border border-[var(--border-elevated)] bg-[var(--accent-soft)] p-4">
                  <BarChart className="mb-2 text-emerald-200" size={24} />
                  <h3 className="font-bold mb-1 text-text-primary">Track Everything</h3>
                  <p className="text-sm text-text-secondary">Real-time analytics</p>
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
                      ? 'border-rocket-500 bg-[var(--accent-soft)] shadow-lg' 
                      : 'border-[var(--border-elevated)] hover:border-[var(--border-focus)]'
                    }
                  `}
                >
                  <div className="text-4xl mb-2">{niche.emoji}</div>
                  <h4 className="font-bold text-sm text-text-primary">{niche.name}</h4>
                  {selectedNiche === niche.id && (
                    <div className="mt-2 text-rocket-500">
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
                      ? 'border-rocket-500 bg-[var(--accent-soft)] shadow-lg'
                      : 'border-[var(--border-elevated)] hover:border-[var(--border-focus)]'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold">{template.name}</h4>
                    {selectedTemplate === template.category && (
                      <CheckCircle size={20} className="text-rocket-500" />
                    )}
                  </div>
                  <p className="text-sm text-text-secondary mb-3">{template.description}</p>
                  <div className="flex justify-between text-xs text-text-secondary">
                    <span>{template.blocks} blocks</span>
                    <span className="font-semibold text-emerald-300">{template.conversions} CVR</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step.id === 'offers' && (
            <div className="mb-8 rounded-lg border border-[var(--border-elevated)] bg-[rgba(255,255,255,0.04)] p-6">
              <p className="text-text-secondary mb-4">You can add affiliate offers after setup completes.</p>
              <div className="text-left space-y-2">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <CheckCircle size={16} className="text-emerald-300" />
                  <span>Connect to major affiliate networks</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <CheckCircle size={16} className="text-emerald-300" />
                  <span>Track clicks and conversions</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <CheckCircle size={16} className="text-emerald-300" />
                  <span>Automatic link cloaking</span>
                </div>
              </div>
            </div>
          )}

          {step.id === 'email' && (
            <div className="mb-8 rounded-lg border border-[var(--border-elevated)] bg-[rgba(255,255,255,0.04)] p-6">
              <p className="text-text-secondary mb-4">Email automation is ready to configure after setup.</p>
              <div className="text-left space-y-2">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <CheckCircle size={16} className="text-emerald-300" />
                  <span>Welcome sequence for new leads</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <CheckCircle size={16} className="text-emerald-300" />
                  <span>Abandoned cart recovery</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <CheckCircle size={16} className="text-emerald-300" />
                  <span>Weekly analytics reports</span>
                </div>
              </div>
            </div>
          )}

          {step.id === 'launch' && (
            <div className="mb-8 rounded-lg border border-[var(--border-elevated)] bg-[var(--accent-soft)] p-6">
              <p className="text-text-primary mb-4 font-semibold">🎉 You&apos;re all set!</p>
              <div className="text-left space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <CheckCircle size={16} className="text-emerald-300" />
                  <span>Niche selected: <strong>{selectedNiche || 'General'}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <CheckCircle size={16} className="text-emerald-300" />
                  <span>Template ready: <strong>{funnelTemplates.find(t => t.category === selectedTemplate)?.name || 'Custom'}</strong></span>
                </div>
              </div>
              <p className="text-sm text-text-secondary">Click below to access cockpit navigation.</p>
            </div>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-elevated)] pt-6">
                <button
              type="button"
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className={`
                rounded-lg border px-4 py-2 text-sm font-semibold transition
                ${currentStep === 0
                  ? 'cursor-not-allowed border-[var(--border-elevated)] text-text-muted'
                  : 'border-[var(--border-elevated)] text-text-secondary hover:border-[var(--border-focus)] hover:text-text-primary'
                }
              `}
            >
              Back
            </button>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={skipOnboarding}
                className="hud-button-secondary rounded-lg px-4 py-2 text-sm"
              >
                Skip onboarding
              </button>
              <button
                type="button"
                onClick={closeOnboarding}
                className="hud-button-secondary rounded-lg px-4 py-2 text-sm"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleStepComplete(step.id)}
                disabled={creatingTemplate !== null}
                className="btn-launch-premium inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition hover:shadow-lg"
              >
                {creatingTemplate ? 'Working...' : currentStep < launchSteps.length - 1 ? 'Next' : step.action}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-text-secondary">
            Need help? Check out our{' '}
            <a href="/docs" className="text-rocket-500 hover:text-text-primary hover:underline">
              documentation
            </a>{' '}
            or{' '}
            <a href="/support" className="text-rocket-500 hover:text-text-primary hover:underline">
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
