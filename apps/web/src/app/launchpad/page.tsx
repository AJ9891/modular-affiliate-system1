'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import PreflightIntentScreen from '@/components/launchpad/PreflightIntentScreen'
import StartupChecklistScreen from '@/components/launchpad/StartupChecklistScreen'
import GuidedBuilderFlight from '@/components/launchpad/GuidedBuilderFlight'
import LaunchpadCopilotAssist from '@/components/launchpad/LaunchpadCopilotAssist'
import {
  LAUNCHPAD_INTENT_OPTIONS,
  getIntentPreset,
  isLaunchpadIntentId,
  type LaunchpadIntentId,
} from '@/lib/launchpad/preflight'
import {
  getMissingStartupChecklistFields,
  getStartupChecklistProgress,
  getStartupDefaultsFromIntent,
  mapTrafficGoalToSource,
  type StartupChecklistField,
  type StartupFunnelType,
  type StartupTrafficGoal,
} from '@/lib/launchpad/startupChecklist'
import type { LaunchpadCopilotTargetStep } from '@/lib/launchpad/copilot'
import {
  getUnlockedMilestones,
  type LaunchpadMilestone,
  type LaunchpadMilestoneId,
} from '@/lib/launchpad/milestones'
import {
  getHesitationTip,
  getStepUnlockMessage,
  isLaunchpadStepId,
} from '@/lib/launchpad/contextualGuidance'

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
  Sparkles,
  Copy
} from 'lucide-react'

const NICHE_OPTIONS = [
  { id: 'health', name: 'Health & Wellness', emoji: '💪' },
  { id: 'finance', name: 'Finance & Investing', emoji: '💰' },
  { id: 'technology', name: 'Technology & Software', emoji: '💻' },
  { id: 'dating', name: 'Dating & Relationships', emoji: '❤️' },
  { id: 'education', name: 'Education & Courses', emoji: '🎓' },
  { id: 'custom', name: 'Custom Niche', emoji: '✨' },
  { id: 'general', name: 'General', emoji: '🎯' },
] as const

const QUICK_PRODUCT_TYPES = [
  { id: 'digital-product', label: 'Digital Product', defaultNiche: 'education' },
  { id: 'software-saas', label: 'Software / SaaS', defaultNiche: 'technology' },
  { id: 'coaching-service', label: 'Coaching Service', defaultNiche: 'education' },
  { id: 'affiliate-offer', label: 'Affiliate Offer', defaultNiche: 'general' },
  { id: 'launchpad-platform', label: 'Platform-as-Product (Launchpad)', defaultNiche: 'technology' },
] as const

const PREFLIGHT_COMPLETE_KEY = 'launchpad_preflight_complete'
const PREFLIGHT_INTENT_KEY = 'launchpad_intent'
const STARTUP_CHECKLIST_COMPLETE_KEY = 'launchpad_startup_checklist_complete'
const LAUNCHPAD_SEEN_MILESTONES_KEY = 'launchpad_seen_milestones'

const QUICK_TRAFFIC_SOURCES = [
  { id: 'paid', label: 'Paid Traffic' },
  { id: 'organic', label: 'Organic Traffic' },
  { id: 'email', label: 'Email Traffic' },
  { id: 'social', label: 'Social Traffic' },
] as const

const QUICK_GOALS = [
  { id: 'lead-capture', label: 'Lead Capture' },
  { id: 'book-calls', label: 'Book Calls' },
  { id: 'direct-sales', label: 'Direct Sales' },
  { id: 'webinar-signup', label: 'Webinar Signup' },
] as const

type QuickProductType = typeof QUICK_PRODUCT_TYPES[number]['id']
type QuickTrafficSource = typeof QUICK_TRAFFIC_SOURCES[number]['id']
type QuickGoal = typeof QUICK_GOALS[number]['id']

const GOAL_TO_TEMPLATE: Record<QuickGoal, 'lead-gen' | 'review' | 'vsl' | 'webinar'> = {
  'lead-capture': 'lead-gen',
  'book-calls': 'vsl',
  'direct-sales': 'review',
  'webinar-signup': 'webinar',
}

const TRAFFIC_SOURCE_PROFILES: Record<
  QuickTrafficSource,
  {
    label: string
    headline: string
    guidance: string
    cadence: string
  }
> = {
  paid: {
    label: 'Paid',
    headline: 'Fast clarity for cost-per-click economics',
    guidance: 'Lead with offer clarity and immediate payoff above the fold.',
    cadence: 'Short copy, tight CTA, low-friction progression.',
  },
  organic: {
    label: 'Organic',
    headline: 'Trust-first positioning for intent-driven discovery',
    guidance: 'Use educational framing and proof before hard ask.',
    cadence: 'Value-first copy with layered CTA escalation.',
  },
  email: {
    label: 'Email',
    headline: 'Warm-audience conversion profile',
    guidance: 'Assume prior context and move faster to action.',
    cadence: 'Bridge copy plus one primary conversion path.',
  },
  social: {
    label: 'Social',
    headline: 'Attention-window optimized profile',
    guidance: 'Hook quickly with direct outcome language and visual hierarchy.',
    cadence: 'Punchy sections with frequent CTA opportunities.',
  },
}

function getQuickLabel<T extends { id: string; label: string }>(options: readonly T[], id: string) {
  return options.find((item) => item.id === id)?.label || id
}

function stripTrackingParams(urlValue: string) {
  try {
    const parsed = new URL(urlValue)
    const trackingParams = ['aff_funnel', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
    for (const param of trackingParams) {
      parsed.searchParams.delete(param)
    }
    return parsed.toString()
  } catch {
    return urlValue
  }
}

function buildTrackingHref(offerId: string, funnelId: string, campaign: string) {
  return `/api/redirect/${offerId}?aff_funnel=${encodeURIComponent(
    funnelId
  )}&utm_source=launchpad&utm_medium=funnel&utm_campaign=${encodeURIComponent(campaign)}`
}

function extractRedirectOfferId(urlValue: string) {
  const match = urlValue.match(/\/api\/redirect\/([^/?#]+)/i)
  if (!match?.[1]) return null
  try {
    return decodeURIComponent(match[1])
  } catch {
    return match[1]
  }
}

function createSmartDefaultBlocks({
  productType,
  trafficSource,
  goal,
}: {
  productType: QuickProductType
  trafficSource: QuickTrafficSource
  goal: QuickGoal
}) {
  const productLabel = getQuickLabel(QUICK_PRODUCT_TYPES, productType)
  const trafficLabel = getQuickLabel(QUICK_TRAFFIC_SOURCES, trafficSource)
  const goalLabel = getQuickLabel(QUICK_GOALS, goal)

  const goalCopy: Record<QuickGoal, { promise: string; cta: string; outcome: string }> = {
    'lead-capture': {
      promise: 'Capture qualified leads and follow up automatically.',
      cta: 'Get The Free Starter Kit',
      outcome: 'Leads flow into your list for nurture and conversion.',
    },
    'book-calls': {
      promise: 'Warm prospects and convert intent into booked calls.',
      cta: 'Book Your Strategy Call',
      outcome: 'Visitors qualify themselves before they hit your calendar.',
    },
    'direct-sales': {
      promise: 'Move traffic straight to conversion without extra steps.',
      cta: 'See The Recommended Offer',
      outcome: 'Clicks route to your monetized destination with tracking.',
    },
    'webinar-signup': {
      promise: 'Register and remind high-intent visitors for your training.',
      cta: 'Reserve My Seat',
      outcome: 'Signups collect and receive reminder-driven follow-up.',
    },
  }

  const sourceHint: Record<QuickTrafficSource, string> = {
    paid: 'Built for paid traffic with fast clarity and friction-aware copy.',
    organic: 'Built for intent-driven discovery and credibility-first messaging.',
    email: 'Built for warm audiences with direct conversion pathways.',
    social: 'Built for short attention windows and scroll-stopping structure.',
  }

  const selectedGoal = goalCopy[goal]
  const isPlatformAsProduct = productType === 'launchpad-platform'

  return [
    {
      id: `hero-${Date.now()}`,
      type: 'hero',
      content: {
        headline: isPlatformAsProduct
          ? 'Launchpad Built This Funnel With Launchpad'
          : `${productLabel} Funnel: ${goalLabel}`,
        subheadline: `${selectedGoal.promise} ${sourceHint[trafficSource]} Traffic source: ${trafficLabel}.`,
        cta: selectedGoal.cta,
      },
      style: { align: 'center' },
    },
    {
      id: `features-${Date.now()}`,
      type: 'features',
      content: {
        headline: 'Smart Defaults Applied',
        features: [
          {
            icon: '⚡',
            title: 'Pre-selected Layout',
            description: 'Page structure selected from your product + goal profile.',
          },
          {
            icon: '🧠',
            title: 'Conversion Copy Blocks',
            description: 'Starter messaging generated for your traffic source.',
          },
          {
            icon: '🔁',
            title: 'Flow Ready',
            description: selectedGoal.outcome,
          },
          ...(isPlatformAsProduct
            ? [
                {
                  icon: '🚀',
                  title: 'Product Uses Product',
                  description: 'This funnel demonstrates the same launch workflow users buy.',
                },
              ]
            : []),
        ],
      },
      style: {},
    },
    {
      id: `capture-${Date.now()}`,
      type: 'email-capture',
      content: {
        headline: 'Stay in the loop',
        subheadline: 'Join the list for updates, offers, and launch notifications.',
        placeholder: 'Enter your email',
        buttonText: 'Join now',
      },
      style: {},
    },
    {
      id: `cta-${Date.now()}`,
      type: 'cta',
      content: {
        headline: 'Ready to launch?',
        subheadline: 'Your funnel is ready to customize, relink, and publish.',
        buttonText: selectedGoal.cta,
      },
      style: { align: 'center' },
    },
  ]
}

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
  const ONBOARDING_COMPLETE = 6
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
    visitors: 0,
    leads: 0,
    revenue: 0,
    conversions: 0
  })

  type LaunchpadTemplate = {
    name: string
    description: string
    blocks: number
    conversions: string
    category: string
  }

  type OfferRecord = {
    id: string
    name: string
    description?: string | null
    affiliate_link: string
    commission_rate?: number | null
    active?: boolean
    is_active?: boolean
  }

  type FunnelRecord = {
    funnel_id: string
    name: string
    slug?: string | null
    blocks?: unknown
  }

  const [offers, setOffers] = useState<OfferRecord[]>([])
  const [offersLoading, setOffersLoading] = useState(false)
  const [selectedOfferId, setSelectedOfferId] = useState('')
  const [creatingOfferInline, setCreatingOfferInline] = useState(false)
  const [attachingOffer, setAttachingOffer] = useState(false)
  const [offerAttached, setOfferAttached] = useState(false)
  const [provisioningEmail, setProvisioningEmail] = useState(false)
  const [emailAutomationReady, setEmailAutomationReady] = useState(false)
  const [publishingFunnel, setPublishingFunnel] = useState(false)
  const [funnelPublished, setFunnelPublished] = useState(false)
  const [attachedOfferId, setAttachedOfferId] = useState<string | null>(null)
  const [launchChecksRunning, setLaunchChecksRunning] = useState(false)
  const [launchChecks, setLaunchChecks] = useState({
    previewOk: false,
    ctaOk: false,
    lastRunAt: null as string | null,
  })
  const [newOffer, setNewOffer] = useState({
    name: '',
    description: '',
    affiliate_link: '',
    commission_rate: 30,
  })
  const [preflightComplete, setPreflightComplete] = useState(false)
  const [launchIntent, setLaunchIntent] = useState<LaunchpadIntentId>('first-funnel')
  const [startupChecklistComplete, setStartupChecklistComplete] = useState(false)
  const [startupChecklistMissingFields, setStartupChecklistMissingFields] = useState<StartupChecklistField[]>([])
  const [campaignName, setCampaignName] = useState('')
  const [startupFunnelType, setStartupFunnelType] = useState<StartupFunnelType | ''>('lead-gen')
  const [startupTrafficGoal, setStartupTrafficGoal] = useState<StartupTrafficGoal | ''>('first-100-visitors')
  const [seenMilestones, setSeenMilestones] = useState<LaunchpadMilestoneId[]>([])
  const [milestoneQueue, setMilestoneQueue] = useState<LaunchpadMilestone[]>([])
  const [stepUnlockMessage, setStepUnlockMessage] = useState('')
  const [showHesitationTip, setShowHesitationTip] = useState(false)
  const [quickProductType, setQuickProductType] = useState<QuickProductType>('digital-product')
  const [quickTrafficSource, setQuickTrafficSource] = useState<QuickTrafficSource>('organic')
  const [quickGoal, setQuickGoal] = useState<QuickGoal>('lead-capture')
  const [quickStartCreating, setQuickStartCreating] = useState(false)
  const [duplicateFunnels, setDuplicateFunnels] = useState<FunnelRecord[]>([])
  const [duplicateFunnelsLoading, setDuplicateFunnelsLoading] = useState(false)
  const [duplicateSourceFunnelId, setDuplicateSourceFunnelId] = useState('')
  const [duplicateTargetNiche, setDuplicateTargetNiche] = useState('general')
  const [duplicateOfferId, setDuplicateOfferId] = useState('')
  const [duplicatingFunnel, setDuplicatingFunnel] = useState(false)
  const [swapTargetFunnelId, setSwapTargetFunnelId] = useState('')
  const [swapToOfferId, setSwapToOfferId] = useState('')
  const [swappingOfferLinks, setSwappingOfferLinks] = useState(false)
  const [governanceSourceOfferId, setGovernanceSourceOfferId] = useState('')
  const [governanceTargetOfferId, setGovernanceTargetOfferId] = useState('')
  const [governanceRunning, setGovernanceRunning] = useState(false)
  const lastInteractionAtRef = useRef<number>(Date.now())
  const hesitationShownForStepRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    loadUserData()

    const niche = searchParams.get('niche')
    if (niche) {
      setSelectedNiche(niche)
      if (typeof window !== 'undefined') {
        localStorage.setItem('launchpad_selected_niche', niche)
      }
      setCurrentStep(2)
      return
    }

    if (typeof window !== 'undefined') {
      const savedIntent = localStorage.getItem(PREFLIGHT_INTENT_KEY)
      if (savedIntent && isLaunchpadIntentId(savedIntent)) {
        setLaunchIntent(savedIntent)
      }
      const preflightSaved = localStorage.getItem(PREFLIGHT_COMPLETE_KEY)
      if (preflightSaved === '1') {
        setPreflightComplete(true)
      }
      const startupChecklistSaved = localStorage.getItem(STARTUP_CHECKLIST_COMPLETE_KEY)
      if (startupChecklistSaved === '1') {
        setStartupChecklistComplete(true)
      }
      const savedNiche = localStorage.getItem('launchpad_selected_niche')
      if (savedNiche) {
        setSelectedNiche(savedNiche)
      }
      const seenMilestonesRaw = localStorage.getItem(LAUNCHPAD_SEEN_MILESTONES_KEY)
      if (seenMilestonesRaw) {
        try {
          const parsed = JSON.parse(seenMilestonesRaw)
          if (Array.isArray(parsed)) {
            const valid = parsed.filter(
              (value): value is LaunchpadMilestoneId =>
                value === 'first-100-visitors' || value === 'first-conversion'
            )
            setSeenMilestones(valid)
          }
        } catch {
          // ignore malformed storage
        }
      }
    }
  }, [searchParams])

  useEffect(() => {
    setStepValidationError(null)
  }, [currentStep])

  useEffect(() => {
    const current = launchSteps[currentStep]?.id
    if (current === 'offers') {
      void loadOffers()
    }
  }, [currentStep])

  useEffect(() => {
    const status = `${createdFunnel?.funnel?.status || ''}`.toLowerCase()
    setFunnelPublished(status === 'published')
  }, [createdFunnel])

  useEffect(() => {
    if (!selectedNiche || typeof window === 'undefined') return
    localStorage.setItem('launchpad_selected_niche', selectedNiche)
  }, [selectedNiche])

  useEffect(() => {
    if (!selectedNiche) return
    setDuplicateTargetNiche(selectedNiche)
  }, [selectedNiche])

  useEffect(() => {
    const shouldLoadDashboardData = setupComplete || stats.funnels > 0
    if (!shouldLoadDashboardData) return
    void loadDuplicateFunnels()
    void loadOffers()
  }, [setupComplete, stats.funnels])

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
            visitors: statsData.stats?.totalClicks || 0,
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

  const loadDuplicateFunnels = async () => {
    try {
      setDuplicateFunnelsLoading(true)
      const response = await fetch('/api/funnels', { cache: 'no-store' })
      if (!response.ok) return
      const payload = await response.json()
      const rows: unknown[] = Array.isArray(payload?.funnels) ? payload.funnels : []
      const normalized = rows
        .filter((row: unknown): row is Record<string, unknown> => typeof row === 'object' && row !== null)
        .map((row): FunnelRecord => ({
          funnel_id: String(row.funnel_id || ''),
          name: String(row.name || ''),
          slug: typeof row.slug === 'string' ? row.slug : null,
          blocks: row.blocks,
        }))
        .filter((row: FunnelRecord) => row.funnel_id.length > 0 && row.name.length > 0)
      setDuplicateFunnels(normalized)
      if (!duplicateSourceFunnelId && normalized.length > 0) {
        setDuplicateSourceFunnelId(normalized[0].funnel_id)
      }
      if (!swapTargetFunnelId && normalized.length > 0) {
        setSwapTargetFunnelId(normalized[0].funnel_id)
      }
    } catch (error) {
      console.error('Failed to load duplicate funnel list:', error)
    } finally {
      setDuplicateFunnelsLoading(false)
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

  const funnelTemplates: LaunchpadTemplate[] = [
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

  const stepPurpose: Record<string, string> = {
    welcome: 'You will see the full flow before touching settings, so each action has context.',
    niche: 'Your niche controls language, examples, and offer fit. Pick this first so copy and offers align.',
    funnel: 'A working funnel starts as a real saved draft. This creates the public slug you will preview and share.',
    offers: 'Offers give your funnel monetization targets, so CTA buttons have somewhere valuable to send traffic.',
    email: 'Most visitors do not buy on first click. Follow-up email recovers intent and compounds conversion rate.',
    launch: 'Publishing is where tracking starts. You need a real URL live so clicks, leads, and revenue can be measured.',
  }

  const isOnboardingFlightActive =
    preflightComplete && startupChecklistComplete && !setupComplete && !showSuccessScreen

  useEffect(() => {
    if (!isOnboardingFlightActive) return
    const stepId = launchSteps[currentStep]?.id
    if (!stepId || !isLaunchpadStepId(stepId)) return

    setStepUnlockMessage(getStepUnlockMessage(stepId))
    setShowHesitationTip(false)
    lastInteractionAtRef.current = Date.now()
  }, [currentStep, isOnboardingFlightActive])

  useEffect(() => {
    if (!isOnboardingFlightActive) return
    const stepId = launchSteps[currentStep]?.id
    if (!stepId || !isLaunchpadStepId(stepId)) return

    const markInteraction = () => {
      lastInteractionAtRef.current = Date.now()
    }

    const listeners: Array<keyof WindowEventMap> = ['click', 'keydown', 'mousemove', 'touchstart']
    listeners.forEach((name) => window.addEventListener(name, markInteraction, { passive: true }))

    const interval = window.setInterval(() => {
      const idleForMs = Date.now() - lastInteractionAtRef.current
      if (idleForMs < 15000) return
      if (hesitationShownForStepRef.current.has(stepId)) return
      hesitationShownForStepRef.current.add(stepId)
      setShowHesitationTip(true)
    }, 1000)

    return () => {
      listeners.forEach((name) => window.removeEventListener(name, markInteraction))
      window.clearInterval(interval)
    }
  }, [currentStep, isOnboardingFlightActive])

  const getCreatedFunnelId = () =>
    createdFunnel?.funnel?.funnel_id || createdFunnel?.funnelId || null

  const getCreatedFunnelSlug = () =>
    createdFunnel?.funnel?.slug || createdFunnel?.slug || null

  const getPublicFunnelPath = () => {
    const slug = getCreatedFunnelSlug()
    if (slug) return `/f/${encodeURIComponent(slug)}`
    return ''
  }

  const getAttachedTrackingPath = () => {
    const funnelId = getCreatedFunnelId()
    if (!funnelId || !attachedOfferId) return null

    return `/api/redirect/${attachedOfferId}?aff_funnel=${encodeURIComponent(funnelId)}&utm_source=launchpad&utm_medium=funnel&utm_campaign=onboarding`
  }

  const resetLaunchChecks = () => {
    setLaunchChecks({
      previewOk: false,
      ctaOk: false,
      lastRunAt: null,
    })
  }

  const normalizeOffers = (rows: unknown[]): OfferRecord[] => {
    return rows
      .filter((row): row is Record<string, unknown> => typeof row === 'object' && row !== null)
      .map((row) => ({
        id: String(row.id || ''),
        name: String(row.name || ''),
        description: typeof row.description === 'string' ? row.description : null,
        affiliate_link: String(row.affiliate_link || ''),
        commission_rate: typeof row.commission_rate === 'number' ? row.commission_rate : null,
        active: typeof row.active === 'boolean' ? row.active : undefined,
        is_active: typeof row.is_active === 'boolean' ? row.is_active : undefined,
      }))
      .filter((row) => row.id.length > 0 && row.name.length > 0 && row.affiliate_link.length > 0)
  }

  const isOfferActive = (offer: OfferRecord) => {
    if (typeof offer.is_active === 'boolean') return offer.is_active
    if (typeof offer.active === 'boolean') return offer.active
    return true
  }

  const getSelectedOffer = () => offers.find((offer) => offer.id === selectedOfferId) || null

  const loadOffers = async () => {
    try {
      setOffersLoading(true)
      const response = await fetch('/api/offers', { cache: 'no-store' })
      if (!response.ok) {
        setStepValidationError('Could not load offers. Try again.')
        return
      }

      const payload = await response.json()
      const rows = Array.isArray(payload?.offers) ? payload.offers : []
      const normalized = normalizeOffers(rows)
      const activeOnly = normalized.filter(isOfferActive)
      setOffers(activeOnly)

      if (!selectedOfferId && activeOnly.length > 0) {
        setSelectedOfferId(activeOnly[0].id)
      }
    } catch (error) {
      console.error('Failed to load offers for onboarding:', error)
      setStepValidationError('Failed to load offers right now.')
    } finally {
      setOffersLoading(false)
    }
  }

  const createOfferInline = async () => {
    if (!newOffer.name.trim() || !newOffer.affiliate_link.trim() || !newOffer.description.trim()) {
      setStepValidationError('Offer name, description, and affiliate link are required.')
      return
    }

    try {
      setCreatingOfferInline(true)
      setStepValidationError(null)
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newOffer.name.trim(),
          description: newOffer.description.trim(),
          affiliate_link: newOffer.affiliate_link.trim(),
          commission_rate: Number(newOffer.commission_rate) || 0,
        }),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        setStepValidationError(payload?.error || 'Failed to create offer.')
        return
      }

      const created = payload?.offer
      if (!created) {
        setStepValidationError('Offer created but could not be selected.')
        return
      }

      const normalized = normalizeOffers([created])[0]
      if (normalized) {
        setOffers((prev) => [normalized, ...prev])
        setSelectedOfferId(normalized.id)
        setOperationNotice(`Offer "${normalized.name}" created and selected.`)
      }

      setNewOffer({
        name: '',
        description: '',
        affiliate_link: '',
        commission_rate: 30,
      })
    } catch (error) {
      console.error('Failed to create onboarding offer:', error)
      setStepValidationError('Failed to create offer.')
    } finally {
      setCreatingOfferInline(false)
    }
  }

  const attachSelectedOfferToFunnel = async () => {
    const funnelId = getCreatedFunnelId()
    const selectedOffer = getSelectedOffer()
    if (!funnelId || !selectedOffer) {
      setStepValidationError('Create a funnel and select an offer first.')
      return false
    }

    try {
      setAttachingOffer(true)
      setStepValidationError(null)

      const getResponse = await fetch(`/api/funnels/${encodeURIComponent(funnelId)}`, { cache: 'no-store' })
      if (!getResponse.ok) {
        setStepValidationError('Failed to load funnel before attaching offer.')
        return false
      }

      const getPayload = await getResponse.json()
      const funnel = getPayload?.funnel
      if (!funnel) {
        setStepValidationError('Funnel not found while attaching offer.')
        return false
      }

      const rawBlocks = typeof funnel.blocks === 'string' ? JSON.parse(funnel.blocks) : (funnel.blocks || {})
      const currentBlocks = Array.isArray(rawBlocks?.blocks) ? rawBlocks.blocks : []
      const trackingHref = `/api/redirect/${selectedOffer.id}?aff_funnel=${encodeURIComponent(funnelId)}&utm_source=launchpad&utm_medium=funnel&utm_campaign=onboarding`

      let patched = false
      const nextBlocks = currentBlocks.map((block: Record<string, unknown>) => {
        const blockType = typeof block?.type === 'string' ? block.type : ''
        if ((blockType === 'hero' || blockType === 'cta') && !patched) {
          patched = true
          const content = typeof block.content === 'object' && block.content ? block.content as Record<string, unknown> : {}
          return {
            ...block,
            content: {
              ...content,
              ctaLink: trackingHref,
              buttonLink: trackingHref,
              affiliateLink: trackingHref,
            },
          }
        }
        return block
      })

      if (!patched) {
        nextBlocks.push({
          id: `cta-offer-${Date.now()}`,
          type: 'cta',
          content: {
            headline: `Explore ${selectedOffer.name}`,
            subheadline: selectedOffer.description || 'Visit the recommended offer.',
            buttonText: 'Open Offer',
            ctaLink: trackingHref,
            buttonLink: trackingHref,
            affiliateLink: trackingHref,
          },
          style: {
            align: 'center',
          },
        })
      }

      const nextPayload = {
        ...rawBlocks,
        offer: {
          id: selectedOffer.id,
          name: selectedOffer.name,
          affiliate_link: selectedOffer.affiliate_link,
        },
        blocks: nextBlocks,
      }

      const updateResponse = await fetch(`/api/funnels/${encodeURIComponent(funnelId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks: nextPayload }),
      })

      const updatePayload = await updateResponse.json().catch(() => ({}))
      if (!updateResponse.ok || !updatePayload?.funnel) {
        setStepValidationError(updatePayload?.error || 'Failed to attach offer to funnel.')
        return false
      }

      setCreatedFunnel((prev: Record<string, unknown>) => ({
        ...(prev || {}),
        funnel: updatePayload.funnel,
      }))
      setAttachedOfferId(selectedOffer.id)
      setOfferAttached(true)
      resetLaunchChecks()
      setOperationNotice(`Offer "${selectedOffer.name}" connected to your funnel CTA.`)
      return true
    } catch (error) {
      console.error('Failed to attach offer:', error)
      setStepValidationError('Unable to attach offer right now.')
      return false
    } finally {
      setAttachingOffer(false)
    }
  }

  const enableEmailAutomation = async () => {
    try {
      setProvisioningEmail(true)
      setStepValidationError(null)
      const response = await fetch('/api/email/automation', { method: 'PUT' })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok || payload?.success === false) {
        setStepValidationError(payload?.error || 'Failed to enable email automation.')
        return false
      }

      setEmailAutomationReady(true)
      setOperationNotice('Default email automations are active for your account.')
      return true
    } catch (error) {
      console.error('Failed to setup email automation:', error)
      setStepValidationError('Failed to enable email automation.')
      return false
    } finally {
      setProvisioningEmail(false)
    }
  }

  const publishCreatedFunnel = async () => {
    const funnelId = getCreatedFunnelId()
    if (!funnelId) {
      setStepValidationError('Create a funnel first.')
      return false
    }

    if (!launchChecks.previewOk || !launchChecks.ctaOk) {
      setStepValidationError('Run and pass Step 4.5 launch checks before publishing.')
      return false
    }

    try {
      setPublishingFunnel(true)
      setStepValidationError(null)

      const response = await fetch(`/api/funnels/${encodeURIComponent(funnelId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'published',
          active: true,
        }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok || !payload?.funnel) {
        setStepValidationError(payload?.error || 'Failed to publish funnel.')
        return false
      }

      setCreatedFunnel((prev: Record<string, unknown>) => ({
        ...(prev || {}),
        funnel: payload.funnel,
      }))
      setFunnelPublished(true)
      setOperationNotice('Funnel published and ready for live traffic.')
      return true
    } catch (error) {
      console.error('Failed to publish funnel:', error)
      setStepValidationError('Failed to publish funnel right now.')
      return false
    } finally {
      setPublishingFunnel(false)
    }
  }

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

    if (stepId === 'funnel' && !createdFunnel) {
      const template = funnelTemplates.find(t => t.category === selectedTemplate)
      if (!template) {
        setStepValidationError('Choose a valid funnel template before continuing.')
        return
      }

      const created = await createFunnelFromTemplate(template, { redirectToBuilder: false })
      if (!created) return
    }

    if (stepId === 'launch' && !createdFunnel) {
      setStepValidationError('Create your funnel first so Launch has a real public URL.')
      return
    }

    if (stepId === 'launch' && (!launchChecks.previewOk || !launchChecks.ctaOk)) {
      setStepValidationError('Run Step 4.5 checks and pass both tests before launching.')
      return
    }

    if (stepId === 'offers' && !offerAttached) {
      setStepValidationError('Attach an offer to your funnel before continuing.')
      return
    }

    if (stepId === 'email' && !emailAutomationReady) {
      setStepValidationError('Enable email automation before continuing.')
      return
    }

    setStepValidationError(null)
    
    if (stepId === 'launch') {
      if (!funnelPublished) {
        const published = await publishCreatedFunnel()
        if (!published) return
      }
      await markOnboardingComplete()
      setShowSuccessScreen(true)
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
    setCreatedFunnel(null)
    setOfferAttached(false)
    setAttachedOfferId(null)
    setEmailAutomationReady(false)
    setFunnelPublished(false)
    resetLaunchChecks()
  }

  const updateNichePreference = (nicheId: string) => {
    setStepValidationError(null)
    setSelectedNiche(nicheId)
    setOperationNotice(`Default niche set to "${nicheId}". You can change it anytime.`)
  }

  const selectTemplate = (template: LaunchpadTemplate) => {
    setStepValidationError(null)
    if (selectedTemplate !== template.category) {
      setCreatedFunnel(null)
      setOfferAttached(false)
      setAttachedOfferId(null)
      setEmailAutomationReady(false)
      setFunnelPublished(false)
      resetLaunchChecks()
    }
    setSelectedTemplate(template.category)
  }

  const createFunnelFromTemplate = async (
    template: LaunchpadTemplate,
    options: { showSuccessScreen?: boolean; redirectToBuilder?: boolean } = {}
  ) => {
    const { showSuccessScreen = false, redirectToBuilder = true } = options
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
        const normalizedFunnel = {
          ...data,
          funnelId: data?.funnelId || data?.funnel?.funnel_id,
          slug: data?.slug || data?.funnel?.slug,
          funnel: data?.funnel || null,
        }
        setCreatedFunnel(normalizedFunnel)
        setOfferAttached(false)
        setAttachedOfferId(null)
        setEmailAutomationReady(false)
        setFunnelPublished(false)
        resetLaunchChecks()
        setOperationNotice(`"${template.name}" is ready.`)
        
        if (showSuccessScreen) {
          setShowSuccessScreen(true)
        } else if (redirectToBuilder) {
          window.location.href = `/visual-builder?funnelId=${normalizedFunnel.funnelId || ''}&niche=${selectedNiche || 'general'}`
        }
        return true
      } else {
        const errorData = await response.json()
        console.error('Failed to create funnel:', errorData)

        setStepValidationError(errorData.error || 'Failed to create funnel.')
        return false
      }
    } catch (error: any) {
      console.error('Failed to create funnel:', error)

      setStepValidationError('Request timed out or failed while creating your funnel.')
      return false
    } finally {
      setCreatingTemplate(null)
    }
  }

  const getOfferById = (offerId: string) => offers.find((offer) => offer.id === offerId) || null

  const injectOfferTrackingIntoBlocks = (
    inputBlocks: Array<Record<string, unknown>>,
    funnelId: string,
    offerId: string,
    campaign = 'quickstart'
  ) => {
    const trackingHref = buildTrackingHref(offerId, funnelId, campaign)
    let replaced = false

    const blocks = inputBlocks.map((block) => {
      const nextBlock = { ...block }
      const type = typeof nextBlock.type === 'string' ? nextBlock.type : ''
      if (type !== 'hero' && type !== 'cta') return nextBlock

      const content =
        typeof nextBlock.content === 'object' && nextBlock.content !== null
          ? { ...(nextBlock.content as Record<string, unknown>) }
          : {}

      content.ctaLink = trackingHref
      content.buttonLink = trackingHref
      content.affiliateLink = trackingHref
      replaced = true

      return {
        ...nextBlock,
        content,
      }
    })

    if (!replaced) {
      blocks.push({
        id: `cta-offer-${Date.now()}`,
        type: 'cta',
        content: {
          headline: 'Recommended Next Step',
          subheadline: 'Open the tracked offer link tied to this funnel.',
          buttonText: 'Open Offer',
          ctaLink: trackingHref,
          buttonLink: trackingHref,
          affiliateLink: trackingHref,
        },
        style: { align: 'center' },
      })
    }

    return blocks
  }

  const readFunnelBlocksPayload = (funnel: Record<string, unknown>) => {
    const rawBlocks =
      typeof funnel.blocks === 'string' ? JSON.parse(funnel.blocks) : (funnel.blocks || {})
    const payload = typeof rawBlocks === 'object' && rawBlocks ? (rawBlocks as Record<string, unknown>) : {}
    const blocks = Array.isArray(payload.blocks) ? (payload.blocks as Array<Record<string, unknown>>) : []
    return { payload, blocks }
  }

  const rewriteOfferLinksInBlocks = ({
    inputBlocks,
    funnelId,
    toOfferId,
    fromOfferId,
    campaign,
  }: {
    inputBlocks: Array<Record<string, unknown>>
    funnelId: string
    toOfferId: string
    fromOfferId?: string
    campaign: string
  }) => {
    const relinkHref = buildTrackingHref(toOfferId, funnelId, campaign)
    let rewiredCount = 0

    const updated = inputBlocks.map((block) => {
      const nextBlock = { ...block }
      const content =
        typeof nextBlock.content === 'object' && nextBlock.content !== null
          ? { ...(nextBlock.content as Record<string, unknown>) }
          : null

      if (!content) return nextBlock

      for (const linkKey of ['ctaLink', 'buttonLink', 'affiliateLink', 'affiliate_link']) {
        const current = content[linkKey]
        if (typeof current !== 'string' || current.trim().length === 0) continue
        const currentOfferId = extractRedirectOfferId(current)
        const shouldReplace = fromOfferId ? currentOfferId === fromOfferId : Boolean(currentOfferId)
        if (!shouldReplace) continue
        content[linkKey] = relinkHref
        rewiredCount += 1
      }

      return {
        ...nextBlock,
        content,
      }
    })

    return {
      blocks: updated,
      rewiredCount,
    }
  }

  const createQuickStartFunnel = async () => {
    try {
      setQuickStartCreating(true)
      setStepValidationError(null)

      const productLabel = getQuickLabel(QUICK_PRODUCT_TYPES, quickProductType)
      const goalLabel = getQuickLabel(QUICK_GOALS, quickGoal)
      const profile = TRAFFIC_SOURCE_PROFILES[quickTrafficSource]
      const niche =
        selectedNiche ||
        QUICK_PRODUCT_TYPES.find((item) => item.id === quickProductType)?.defaultNiche ||
        'general'
      const template = GOAL_TO_TEMPLATE[quickGoal]

      const response = await fetch('/api/funnels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:
            quickProductType === 'launchpad-platform'
              ? 'Launchpad Markets Launchpad Funnel'
              : `${productLabel} ${goalLabel} Funnel`,
          template,
          niche,
          blocks: createSmartDefaultBlocks({
            productType: quickProductType,
            trafficSource: quickTrafficSource,
            goal: quickGoal,
          }),
          theme: {
            sourceProfile: profile.label,
            sourceGuidance: profile.guidance,
            sourceCadence: profile.cadence,
          },
        }),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok || !payload?.funnel) {
        setStepValidationError(payload?.error || 'Failed to generate quick-start funnel.')
        return
      }

      let nextFunnel = payload.funnel
      const createdFunnelId = String(payload.funnel.funnel_id || '')
      const selectedOffer = getOfferById(selectedOfferId)
      const baseBlocksPayload = typeof nextFunnel.blocks === 'object' && nextFunnel.blocks
        ? nextFunnel.blocks
        : {}
      const sourceBlocks = Array.isArray((baseBlocksPayload as Record<string, unknown>).blocks)
        ? ((baseBlocksPayload as Record<string, unknown>).blocks as Array<Record<string, unknown>>)
        : []

      if (selectedOffer && createdFunnelId && sourceBlocks.length > 0) {
        const trackedBlocks = injectOfferTrackingIntoBlocks(sourceBlocks, createdFunnelId, selectedOffer.id)
        const updateResponse = await fetch(`/api/funnels/${encodeURIComponent(createdFunnelId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blocks: {
              ...(baseBlocksPayload as Record<string, unknown>),
              blocks: trackedBlocks,
              offer: {
                id: selectedOffer.id,
                name: selectedOffer.name,
                affiliate_link: selectedOffer.affiliate_link,
              },
            },
          }),
        })
        const updatePayload = await updateResponse.json().catch(() => ({}))
        if (updateResponse.ok && updatePayload?.funnel) {
          nextFunnel = updatePayload.funnel
        }
      }

      const normalizedFunnel = {
        funnel: nextFunnel,
        funnelId: nextFunnel.funnel_id,
        slug: nextFunnel.slug,
      }

      setCreatedFunnel(normalizedFunnel)
      setSelectedTemplate(template)
      setSelectedNiche(niche)
      setOfferAttached(Boolean(selectedOffer))
      setAttachedOfferId(selectedOffer?.id || null)
      setEmailAutomationReady(false)
      setFunnelPublished(false)
      resetLaunchChecks()
      setCurrentStep(2)
      setOperationNotice('Quick-start funnel generated with smart defaults. Open it in the builder to customize.')

      await loadUserData()
      await loadDuplicateFunnels()
    } catch (error) {
      console.error('Failed to quick-start funnel:', error)
      setStepValidationError('Quick-start generation failed.')
    } finally {
      setQuickStartCreating(false)
    }
  }

  const duplicateFunnel = async () => {
    if (!duplicateSourceFunnelId) {
      setStepValidationError('Select a source funnel to duplicate.')
      return
    }

    try {
      setDuplicatingFunnel(true)
      setStepValidationError(null)

      const sourceResponse = await fetch(`/api/funnels/${encodeURIComponent(duplicateSourceFunnelId)}`, { cache: 'no-store' })
      const sourcePayload = await sourceResponse.json().catch(() => ({}))
      if (!sourceResponse.ok || !sourcePayload?.funnel) {
        setStepValidationError(sourcePayload?.error || 'Unable to load source funnel.')
        return
      }

      const sourceFunnel = sourcePayload.funnel as Record<string, unknown>
      const sourceName = typeof sourceFunnel.name === 'string' ? sourceFunnel.name : 'Funnel'
      const rawBlocks =
        typeof sourceFunnel.blocks === 'string'
          ? JSON.parse(sourceFunnel.blocks)
          : (sourceFunnel.blocks || {})
      const sourceBlocks = Array.isArray(rawBlocks?.blocks) ? rawBlocks.blocks : []

      const clonedBlocks = sourceBlocks.map((block: Record<string, unknown>) => {
        const nextBlock = { ...block }
        const content =
          typeof nextBlock.content === 'object' && nextBlock.content !== null
            ? { ...(nextBlock.content as Record<string, unknown>) }
            : {}

        const removableTrackingKeys = ['tracking', 'trackingId', 'conversionCount', 'clickCount', 'lastClickedAt']
        for (const key of removableTrackingKeys) {
          if (key in content) delete content[key]
        }

        for (const linkKey of ['ctaLink', 'buttonLink', 'affiliateLink', 'affiliate_link']) {
          const value = content[linkKey]
          if (typeof value === 'string' && value.trim().length > 0) {
            content[linkKey] = stripTrackingParams(value)
          }
        }

        return {
          ...nextBlock,
          id: typeof nextBlock.id === 'string' ? `${nextBlock.id}-clone-${Date.now()}` : `clone-${Date.now()}`,
          content,
        }
      })

      const cloneName = `${sourceName} (${duplicateTargetNiche || 'general'} clone)`
      const createResponse = await fetch('/api/funnels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cloneName,
          template: rawBlocks?.template || 'custom',
          niche: duplicateTargetNiche || rawBlocks?.niche || 'general',
          blocks: clonedBlocks,
          theme: rawBlocks?.theme || undefined,
        }),
      })

      const createPayload = await createResponse.json().catch(() => ({}))
      if (!createResponse.ok || !createPayload?.funnel) {
        setStepValidationError(createPayload?.error || 'Failed to duplicate funnel.')
        return
      }

      let nextFunnel = createPayload.funnel
      const newFunnelId = String(nextFunnel.funnel_id || '')
      const chosenOffer = getOfferById(duplicateOfferId)

      if (newFunnelId && chosenOffer) {
        const clonedPayload =
          typeof nextFunnel.blocks === 'object' && nextFunnel.blocks ? nextFunnel.blocks : {}
        const clonedPayloadBlocks = Array.isArray((clonedPayload as Record<string, unknown>).blocks)
          ? ((clonedPayload as Record<string, unknown>).blocks as Array<Record<string, unknown>>)
          : []
        const relinked = injectOfferTrackingIntoBlocks(clonedPayloadBlocks, newFunnelId, chosenOffer.id)

        const relinkResponse = await fetch(`/api/funnels/${encodeURIComponent(newFunnelId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blocks: {
              ...(clonedPayload as Record<string, unknown>),
              blocks: relinked,
              offer: {
                id: chosenOffer.id,
                name: chosenOffer.name,
                affiliate_link: chosenOffer.affiliate_link,
              },
            },
          }),
        })
        const relinkPayload = await relinkResponse.json().catch(() => ({}))
        if (relinkResponse.ok && relinkPayload?.funnel) {
          nextFunnel = relinkPayload.funnel
        }
      }

      setCreatedFunnel({
        funnel: nextFunnel,
        funnelId: nextFunnel.funnel_id,
        slug: nextFunnel.slug,
      })
      setOperationNotice(`Funnel duplicated as "${nextFunnel.name}" with tracking reset.`)
      await loadUserData()
      await loadDuplicateFunnels()
    } catch (error) {
      console.error('Failed to duplicate funnel:', error)
      setStepValidationError('One-click duplication failed.')
    } finally {
      setDuplicatingFunnel(false)
    }
  }

  const swapOfferLinksForFunnel = async () => {
    if (!swapTargetFunnelId) {
      setStepValidationError('Select a funnel to update.')
      return
    }
    if (!swapToOfferId) {
      setStepValidationError('Select the replacement offer.')
      return
    }

    try {
      setSwappingOfferLinks(true)
      setStepValidationError(null)

      const funnelResponse = await fetch(`/api/funnels/${encodeURIComponent(swapTargetFunnelId)}`, { cache: 'no-store' })
      const funnelPayload = await funnelResponse.json().catch(() => ({}))
      if (!funnelResponse.ok || !funnelPayload?.funnel) {
        setStepValidationError(funnelPayload?.error || 'Failed to load funnel for offer swap.')
        return
      }

      const funnel = funnelPayload.funnel as Record<string, unknown>
      const funnelId = String(funnel.funnel_id || swapTargetFunnelId)
      const { payload, blocks } = readFunnelBlocksPayload(funnel)
      const fromOfferId = (typeof payload.offer === 'object' && payload.offer && typeof (payload.offer as Record<string, unknown>).id === 'string')
        ? String((payload.offer as Record<string, unknown>).id)
        : undefined
      const rewrite = rewriteOfferLinksInBlocks({
        inputBlocks: blocks,
        funnelId,
        toOfferId: swapToOfferId,
        fromOfferId,
        campaign: 'offer_swap',
      })

      if (rewrite.rewiredCount === 0) {
        setStepValidationError('No governed redirect links found in this funnel to swap.')
        return
      }

      const targetOffer = getOfferById(swapToOfferId)
      const updateResponse = await fetch(`/api/funnels/${encodeURIComponent(funnelId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blocks: {
            ...payload,
            blocks: rewrite.blocks,
            offer: targetOffer
              ? {
                  id: targetOffer.id,
                  name: targetOffer.name,
                  affiliate_link: targetOffer.affiliate_link,
                }
              : payload.offer,
            monetization: {
              linkGoverned: true,
              lastOfferSwapAt: new Date().toISOString(),
            },
          },
        }),
      })

      const updatePayload = await updateResponse.json().catch(() => ({}))
      if (!updateResponse.ok || !updatePayload?.funnel) {
        setStepValidationError(updatePayload?.error || 'Failed to update funnel offer links.')
        return
      }

      setCreatedFunnel({
        funnel: updatePayload.funnel,
        funnelId: updatePayload.funnel.funnel_id,
        slug: updatePayload.funnel.slug,
      })
      setOperationNotice(`Offer links swapped on funnel. ${rewrite.rewiredCount} link field(s) updated.`)
      await loadDuplicateFunnels()
    } catch (error) {
      console.error('Failed offer link swap:', error)
      setStepValidationError('Offer swap failed.')
    } finally {
      setSwappingOfferLinks(false)
    }
  }

  const applyOutboundLinkGovernance = async () => {
    if (!governanceSourceOfferId || !governanceTargetOfferId) {
      setStepValidationError('Choose source and target offers for governance.')
      return
    }
    if (governanceSourceOfferId === governanceTargetOfferId) {
      setStepValidationError('Source and target offers must be different.')
      return
    }

    try {
      setGovernanceRunning(true)
      setStepValidationError(null)

      const funnelRows = duplicateFunnels
      let touchedFunnels = 0
      let touchedLinks = 0

      for (const row of funnelRows) {
        const funnelResponse = await fetch(`/api/funnels/${encodeURIComponent(row.funnel_id)}`, { cache: 'no-store' })
        const funnelPayload = await funnelResponse.json().catch(() => ({}))
        if (!funnelResponse.ok || !funnelPayload?.funnel) continue

        const funnel = funnelPayload.funnel as Record<string, unknown>
        const funnelId = String(funnel.funnel_id || row.funnel_id)
        const { payload, blocks } = readFunnelBlocksPayload(funnel)

        const rewrite = rewriteOfferLinksInBlocks({
          inputBlocks: blocks,
          funnelId,
          toOfferId: governanceTargetOfferId,
          fromOfferId: governanceSourceOfferId,
          campaign: 'governance',
        })

        if (rewrite.rewiredCount === 0) continue

        const targetOffer = getOfferById(governanceTargetOfferId)
        const updateResponse = await fetch(`/api/funnels/${encodeURIComponent(funnelId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blocks: {
              ...payload,
              blocks: rewrite.blocks,
              offer: targetOffer
                ? {
                    id: targetOffer.id,
                    name: targetOffer.name,
                    affiliate_link: targetOffer.affiliate_link,
                  }
                : payload.offer,
              monetization: {
                linkGoverned: true,
                governedFromOfferId: governanceSourceOfferId,
                governedToOfferId: governanceTargetOfferId,
                updatedAt: new Date().toISOString(),
              },
            },
          }),
        })

        if (!updateResponse.ok) continue
        touchedFunnels += 1
        touchedLinks += rewrite.rewiredCount
      }

      if (touchedFunnels === 0) {
        setStepValidationError('No funnels contained the selected source offer links.')
        return
      }

      setOperationNotice(`Governance applied: ${touchedLinks} outbound link field(s) updated across ${touchedFunnels} funnel(s).`)
      await loadDuplicateFunnels()
    } catch (error) {
      console.error('Failed outbound link governance update:', error)
      setStepValidationError('Outbound link governance update failed.')
    } finally {
      setGovernanceRunning(false)
    }
  }

  const getFunnelUrl = () => {
    if (!createdFunnel || typeof window === 'undefined') return ''
    const path = getPublicFunnelPath()
    return path ? `${window.location.origin}${path}` : ''
  }

  const runLaunchChecks = async () => {
    const previewPath = getPublicFunnelPath()
    const trackingPath = getAttachedTrackingPath()
    if (!previewPath) {
      setStepValidationError('Preview URL is not ready. Save your funnel draft first.')
      return false
    }
    if (!trackingPath) {
      setStepValidationError('Offer tracking link is not ready. Attach an offer first.')
      return false
    }

    try {
      setLaunchChecksRunning(true)
      setStepValidationError(null)

      const previewResponse = await fetch(previewPath, {
        method: 'GET',
        cache: 'no-store',
      })

      const ctaResponse = await fetch(trackingPath, {
        method: 'GET',
        cache: 'no-store',
        redirect: 'manual',
      })

      const previewOk = previewResponse.ok
      const ctaOk = ctaResponse.type === 'opaqueredirect' || (ctaResponse.status >= 300 && ctaResponse.status < 400)

      setLaunchChecks({
        previewOk,
        ctaOk,
        lastRunAt: new Date().toISOString(),
      })

      if (!previewOk || !ctaOk) {
        const failures: string[] = []
        if (!previewOk) failures.push('preview load')
        if (!ctaOk) failures.push('CTA redirect')
        setStepValidationError(`Step 4.5 failed: ${failures.join(' and ')} check did not pass.`)
        return false
      }

      setOperationNotice('Step 4.5 passed: preview and CTA redirect checks are green.')
      return true
    } catch (error) {
      console.error('Launch checks failed:', error)
      setStepValidationError('Could not run launch checks right now.')
      return false
    } finally {
      setLaunchChecksRunning(false)
    }
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

  const completePreflight = () => {
    const preset = getIntentPreset(launchIntent)
    const startupDefaults = getStartupDefaultsFromIntent(launchIntent)
    setSelectedNiche((previous) => previous || preset.suggestedNiche)
    setSelectedTemplate((previous) => previous || preset.suggestedTemplate)
    setStartupFunnelType(startupDefaults.funnelType)
    setStartupTrafficGoal(startupDefaults.trafficGoal)
    setOperationNotice(preset.notice)
    setCurrentStep(preset.nextStep)
    setPreflightComplete(true)

    if (typeof window !== 'undefined') {
      localStorage.setItem(PREFLIGHT_COMPLETE_KEY, '1')
      localStorage.setItem(PREFLIGHT_INTENT_KEY, launchIntent)
    }
  }

  const completeStartupChecklist = () => {
    const checklistState = {
      campaignName,
      funnelType: startupFunnelType,
      trafficGoal: startupTrafficGoal,
    }
    const missing = getMissingStartupChecklistFields(checklistState)
    setStartupChecklistMissingFields(missing)

    if (missing.length > 0) return

    const sourceProfile = mapTrafficGoalToSource(startupTrafficGoal as StartupTrafficGoal)
    setSelectedTemplate(startupFunnelType as string)
    setQuickTrafficSource(sourceProfile)
    setStartupChecklistComplete(true)
    setCurrentStep(1)
    setOperationNotice(`Checklist complete for "${campaignName.trim()}". Guided launch is ready.`)

    if (typeof window !== 'undefined') {
      localStorage.setItem(STARTUP_CHECKLIST_COMPLETE_KEY, '1')
    }
  }

  useEffect(() => {
    if (loadingUserData) return
    if (!(setupComplete || stats.funnels > 0)) return

    const unlocked = getUnlockedMilestones(
      { visitors: stats.visitors, conversions: stats.conversions },
      new Set(seenMilestones)
    )

    if (unlocked.length === 0) return

    setMilestoneQueue((previous) => [...previous, ...unlocked])
    const nextSeen = [...new Set([...seenMilestones, ...unlocked.map((item) => item.id)])]
    setSeenMilestones(nextSeen)

    if (typeof window !== 'undefined') {
      localStorage.setItem(LAUNCHPAD_SEEN_MILESTONES_KEY, JSON.stringify(nextSeen))
    }
  }, [loadingUserData, setupComplete, stats.funnels, stats.visitors, stats.conversions, seenMilestones])

  const dismissMilestone = () => {
    setMilestoneQueue((previous) => previous.slice(1))
  }

  const jumpToCopilotStep = (targetStep: LaunchpadCopilotTargetStep) => {
    const targetIndex = launchSteps.findIndex((step) => step.id === targetStep)
    if (targetIndex < 0) return
    setCurrentStep(targetIndex)
    setStepValidationError(null)
    setOperationNotice(`Copilot rerouted you to ${targetStep}.`)
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
              onClick={() => window.location.href = `/visual-builder?funnelId=${getCreatedFunnelId()}&niche=${selectedNiche}`}
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
    const conversionRate = stats.visitors > 0 ? (stats.conversions / stats.visitors) * 100 : 0
    const activeMilestone = milestoneQueue[0] || null

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
            {stepValidationError && (
              <p className="mt-3 inline-flex rounded-lg border border-red-400/35 bg-red-500/10 px-3 py-1 text-sm text-red-200">
                {stepValidationError}
              </p>
            )}
          </div>

          <section className="mb-8 rounded-xl border border-[var(--border-elevated)] bg-[rgba(255,255,255,0.03)] p-6">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-system text-text-secondary">Cockpit Dashboard</p>
              <h2 className="text-2xl font-semibold text-text-primary">Instrument Panel</h2>
              <p className="mt-1 text-sm text-text-secondary">Calm signal, clear trajectory, next action visibility.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-[var(--border-elevated)] bg-[rgba(10,16,24,0.55)] p-4">
                <p className="text-xs uppercase tracking-system text-text-secondary">Visitor Count</p>
                <p className="mt-2 text-3xl font-semibold text-text-primary">{stats.visitors.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-[var(--border-elevated)] bg-[rgba(10,16,24,0.55)] p-4">
                <p className="text-xs uppercase tracking-system text-text-secondary">Conversion Rate</p>
                <p className="mt-2 text-3xl font-semibold text-text-primary">{conversionRate.toFixed(2)}%</p>
              </div>
              <div className="rounded-lg border border-[var(--border-elevated)] bg-[rgba(10,16,24,0.55)] p-4">
                <p className="text-xs uppercase tracking-system text-text-secondary">Active Funnels</p>
                <p className="mt-2 text-3xl font-semibold text-text-primary">{stats.funnels}</p>
              </div>
            </div>
          </section>

          <div className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="card-premium rounded-xl border border-[var(--border-elevated)] p-6">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-text-primary">Quick-Start Funnel Generator</h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    Single-screen setup: choose product type, traffic source, and goal. We generate a working funnel structure instantly.
                  </p>
                </div>
                <span className="rounded-full border border-cyan-300/35 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                  Smart Defaults
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <label className="text-left text-xs text-text-secondary">
                  Product Type
                  <select
                    value={quickProductType}
                    onChange={(event) => setQuickProductType(event.target.value as QuickProductType)}
                    className="hud-select mt-1 w-full"
                  >
                    {QUICK_PRODUCT_TYPES.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-left text-xs text-text-secondary">
                  Traffic Source
                  <select
                    value={quickTrafficSource}
                    onChange={(event) => setQuickTrafficSource(event.target.value as QuickTrafficSource)}
                    className="hud-select mt-1 w-full"
                  >
                    {QUICK_TRAFFIC_SOURCES.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-left text-xs text-text-secondary">
                  Goal
                  <select
                    value={quickGoal}
                    onChange={(event) => setQuickGoal(event.target.value as QuickGoal)}
                    className="hud-select mt-1 w-full"
                  >
                    {QUICK_GOALS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-3 grid gap-2 md:grid-cols-4">
                {(Object.entries(TRAFFIC_SOURCE_PROFILES) as Array<[QuickTrafficSource, (typeof TRAFFIC_SOURCE_PROFILES)[QuickTrafficSource]]>).map(
                  ([profileId, profile]) => (
                    <button
                      key={profileId}
                      type="button"
                      onClick={() => setQuickTrafficSource(profileId)}
                      className={`rounded-lg border p-3 text-left transition ${
                        quickTrafficSource === profileId
                          ? 'border-rocket-500 bg-[var(--accent-soft)]'
                          : 'border-[var(--border-elevated)] hover:border-[var(--border-focus)]'
                      }`}
                    >
                      <p className="text-xs font-semibold text-text-primary">{profile.label}</p>
                      <p className="mt-1 text-[11px] text-text-secondary">{profile.headline}</p>
                    </button>
                  )
                )}
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                <label className="text-left text-xs text-text-secondary">
                  Optional: relink CTA to offer
                  <select
                    value={selectedOfferId}
                    onChange={(event) => setSelectedOfferId(event.target.value)}
                    className="hud-select mt-1 w-full"
                  >
                    <option value="">No offer selected</option>
                    {offers.map((offer) => (
                      <option key={offer.id} value={offer.id}>
                        {offer.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={createQuickStartFunnel}
                  disabled={quickStartCreating}
                  className="btn-launch-premium rounded-lg px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {quickStartCreating ? 'Generating...' : 'Generate Funnel'}
                </button>
              </div>

              <p className="mt-3 text-xs text-text-secondary">
                Defaults selected: <strong>{GOAL_TO_TEMPLATE[quickGoal]}</strong> layout, goal-matched copy blocks, and conversion flow.
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                Traffic profile: <strong>{TRAFFIC_SOURCE_PROFILES[quickTrafficSource].headline}</strong>
              </p>
            </section>

            <section className="card-premium rounded-xl border border-[var(--border-elevated)] p-6">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-text-primary">One-Click Funnel Duplication</h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    Clone funnels across niches or offers. We auto-rename, relink, and reset tracking metadata.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-violet-300/35 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-100">
                  <Copy size={12} /> Clone
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-left text-xs text-text-secondary md:col-span-2">
                  Source Funnel
                  <select
                    value={duplicateSourceFunnelId}
                    onChange={(event) => setDuplicateSourceFunnelId(event.target.value)}
                    className="hud-select mt-1 w-full"
                    disabled={duplicateFunnelsLoading}
                  >
                    <option value="">{duplicateFunnelsLoading ? 'Loading funnels...' : 'Select a funnel'}</option>
                    {duplicateFunnels.map((funnel) => (
                      <option key={funnel.funnel_id} value={funnel.funnel_id}>
                        {funnel.name} {funnel.slug ? `(/f/${funnel.slug})` : ''}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-left text-xs text-text-secondary">
                  Target Niche
                  <select
                    value={duplicateTargetNiche}
                    onChange={(event) => setDuplicateTargetNiche(event.target.value)}
                    className="hud-select mt-1 w-full"
                  >
                    {NICHE_OPTIONS.map((niche) => (
                      <option key={niche.id} value={niche.id}>
                        {niche.emoji} {niche.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-left text-xs text-text-secondary">
                  Offer Relink
                  <select
                    value={duplicateOfferId}
                    onChange={(event) => setDuplicateOfferId(event.target.value)}
                    className="hud-select mt-1 w-full"
                  >
                    <option value="">Keep existing links (tracking reset)</option>
                    {offers.map((offer) => (
                      <option key={offer.id} value={offer.id}>
                        {offer.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <button
                type="button"
                onClick={duplicateFunnel}
                disabled={duplicatingFunnel || duplicateFunnelsLoading}
                className="btn-launch-premium mt-4 rounded-lg px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {duplicatingFunnel ? 'Duplicating...' : 'Duplicate Funnel'}
              </button>
            </section>
          </div>

          <div className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="card-premium rounded-xl border border-[var(--border-elevated)] p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-text-primary">Affiliate Offer Swapping</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Replace an offer inside an existing funnel without rebuilding layout or copy.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-left text-xs text-text-secondary md:col-span-2">
                  Target Funnel
                  <select
                    value={swapTargetFunnelId}
                    onChange={(event) => setSwapTargetFunnelId(event.target.value)}
                    className="hud-select mt-1 w-full"
                    disabled={duplicateFunnelsLoading}
                  >
                    <option value="">{duplicateFunnelsLoading ? 'Loading funnels...' : 'Select a funnel'}</option>
                    {duplicateFunnels.map((funnel) => (
                      <option key={funnel.funnel_id} value={funnel.funnel_id}>
                        {funnel.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-left text-xs text-text-secondary md:col-span-2">
                  Replacement Offer
                  <select
                    value={swapToOfferId}
                    onChange={(event) => setSwapToOfferId(event.target.value)}
                    className="hud-select mt-1 w-full"
                  >
                    <option value="">Select an offer</option>
                    {offers.map((offer) => (
                      <option key={offer.id} value={offer.id}>
                        {offer.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <button
                type="button"
                onClick={swapOfferLinksForFunnel}
                disabled={swappingOfferLinks || duplicateFunnelsLoading}
                className="btn-launch-premium mt-4 rounded-lg px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {swappingOfferLinks ? 'Swapping...' : 'Swap Offer Without Rebuild'}
              </button>
            </section>

            <section className="card-premium rounded-xl border border-[var(--border-elevated)] p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-text-primary">Outbound Link Governance</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Central control for affiliate redirects: replace one offer link footprint across all funnels in one action.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-left text-xs text-text-secondary">
                  Source Offer
                  <select
                    value={governanceSourceOfferId}
                    onChange={(event) => setGovernanceSourceOfferId(event.target.value)}
                    className="hud-select mt-1 w-full"
                  >
                    <option value="">Select source</option>
                    {offers.map((offer) => (
                      <option key={offer.id} value={offer.id}>
                        {offer.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-left text-xs text-text-secondary">
                  Replacement Offer
                  <select
                    value={governanceTargetOfferId}
                    onChange={(event) => setGovernanceTargetOfferId(event.target.value)}
                    className="hud-select mt-1 w-full"
                  >
                    <option value="">Select replacement</option>
                    {offers.map((offer) => (
                      <option key={offer.id} value={offer.id}>
                        {offer.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <button
                type="button"
                onClick={applyOutboundLinkGovernance}
                disabled={governanceRunning || duplicateFunnelsLoading}
                className="btn-launch-premium mt-4 rounded-lg px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {governanceRunning ? 'Applying...' : 'Apply Governance'}
              </button>
            </section>
          </div>

          {/* Secondary Stats Grid */}
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

          <div className="mb-12 rounded-xl border border-[var(--border-elevated)] bg-[rgba(255,255,255,0.04)] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-text-primary">Default Niche</h2>
                <p className="text-sm text-text-secondary">
                  Change this anytime after onboarding. New Launchpad funnels will use this niche by default.
                </p>
              </div>
              <select
                value={selectedNiche || 'general'}
                onChange={(event) => updateNichePreference(event.target.value)}
                className="hud-select min-w-[240px]"
              >
                {NICHE_OPTIONS.map((niche) => (
                  <option key={niche.id} value={niche.id}>
                    {niche.emoji} {niche.name}
                  </option>
                ))}
              </select>
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
        {activeMilestone ? (
          <div className="fixed right-4 top-4 z-50 w-[min(92vw,360px)] rounded-xl border border-emerald-300/40 bg-[rgba(7,26,16,0.92)] p-4 shadow-2xl backdrop-blur">
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
              <span className="absolute left-6 top-2 h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-200" />
              <span className="absolute right-8 top-5 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-200" />
              <span className="absolute left-1/2 top-3 h-1.5 w-1.5 animate-pulse rounded-full bg-amber-200" />
            </div>
            <p className="text-xs uppercase tracking-system text-emerald-200">Milestone Unlocked</p>
            <h3 className="mt-1 text-lg font-semibold text-emerald-100">{activeMilestone.title}</h3>
            <p className="mt-2 text-sm text-emerald-50">{activeMilestone.message}</p>
            <button
              type="button"
              onClick={dismissMilestone}
              className="mt-3 rounded-md border border-emerald-300/40 px-3 py-1.5 text-xs text-emerald-100 hover:bg-emerald-400/10"
            >
              Continue
            </button>
          </div>
        ) : null}
      </div>
    )
  }

  if (!preflightComplete) {
    return (
      <PreflightIntentScreen
        options={LAUNCHPAD_INTENT_OPTIONS}
        selectedIntent={launchIntent}
        onSelectIntent={setLaunchIntent}
        onContinue={completePreflight}
      />
    )
  }

  if (!startupChecklistComplete) {
    const throttle = getStartupChecklistProgress({
      campaignName,
      funnelType: startupFunnelType,
      trafficGoal: startupTrafficGoal,
    })

    return (
      <StartupChecklistScreen
        campaignName={campaignName}
        funnelType={startupFunnelType}
        trafficGoal={startupTrafficGoal}
        missingFields={startupChecklistMissingFields}
        throttleLabel={throttle.label}
        onCampaignNameChange={setCampaignName}
        onFunnelTypeChange={setStartupFunnelType}
        onTrafficGoalChange={setStartupTrafficGoal}
        onContinue={completeStartupChecklist}
      />
    )
  }

  // Onboarding for new users
  const step = launchSteps[currentStep]
  const StepIcon = step.icon
  const selectedOffer = getSelectedOffer()
  const hesitationTip = isLaunchpadStepId(step.id) ? getHesitationTip(step.id) : ''
  const copilotContext = {
    stepId: step.id,
    hasFunnel: Boolean(createdFunnel),
    offerAttached,
    emailReady: emailAutomationReady,
    launchChecksPassed: launchChecks.previewOk && launchChecks.ctaOk,
    funnelPublished,
    selectedTemplate,
  }
  const isNextDisabled =
    creatingTemplate !== null ||
    attachingOffer ||
    provisioningEmail ||
    publishingFunnel ||
    launchChecksRunning ||
    (step.id === 'offers' && !offerAttached) ||
    (step.id === 'email' && !emailAutomationReady) ||
    (step.id === 'launch' && (!launchChecks.previewOk || !launchChecks.ctaOk))

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

          <div className="mx-auto mb-8 max-w-2xl rounded-lg border border-amber-300/35 bg-amber-500/10 px-4 py-3 text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-200">Why this step matters</p>
            <p className="mt-1 text-sm text-amber-100">{stepPurpose[step.id]}</p>
          </div>

          {stepUnlockMessage ? (
            <div className="mx-auto mb-6 max-w-2xl rounded-lg border border-cyan-300/35 bg-cyan-500/10 px-4 py-3 text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">Unlocked by this action</p>
              <p className="mt-1 text-sm text-cyan-50">{stepUnlockMessage}</p>
            </div>
          ) : null}

          {showHesitationTip && hesitationTip ? (
            <div className="mx-auto mb-6 max-w-2xl rounded-lg border border-emerald-300/35 bg-emerald-500/10 px-4 py-3 text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100">Guidance Ping</p>
              <p className="mt-1 text-sm text-emerald-50">{hesitationTip}</p>
              <button
                type="button"
                onClick={() => setShowHesitationTip(false)}
                className="mt-2 rounded-md border border-emerald-300/35 px-2.5 py-1 text-xs text-emerald-100 hover:bg-emerald-400/10"
              >
                Dismiss
              </button>
            </div>
          ) : null}

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
              {NICHE_OPTIONS.filter((niche) => niche.id !== 'general').map((niche) => (
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
            <GuidedBuilderFlight
              templates={funnelTemplates}
              selectedTemplate={selectedTemplate}
              createdFunnelPath={getPublicFunnelPath()}
              onSelectTemplate={selectTemplate}
            />
          )}

          {step.id === 'offers' && (
            <div className="mb-8 space-y-4 rounded-lg border border-[var(--border-elevated)] bg-[rgba(255,255,255,0.04)] p-6">
              <p className="text-sm text-text-secondary">
                Select an existing offer or create a new one. We will wire it into your funnel CTA with tracking.
              </p>

              {offersLoading ? (
                <p className="text-sm text-text-secondary">Loading offers...</p>
              ) : offers.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {offers.map((offer) => (
                    <button
                      key={offer.id}
                      type="button"
                      onClick={() => setSelectedOfferId(offer.id)}
                      className={`rounded-lg border p-4 text-left transition ${
                        selectedOfferId === offer.id
                          ? 'border-rocket-500 bg-[var(--accent-soft)]'
                          : 'border-[var(--border-elevated)] hover:border-[var(--border-focus)]'
                      }`}
                    >
                      <p className="font-semibold text-text-primary">{offer.name}</p>
                      <p className="mt-1 text-xs text-text-secondary">{offer.description || 'No description'}</p>
                      <p className="mt-2 text-xs text-emerald-300">
                        {typeof offer.commission_rate === 'number' ? `${offer.commission_rate}% commission` : 'Commission not set'}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-secondary">No active offers found. Create one below.</p>
              )}

              <div className="rounded-lg border border-[var(--border-elevated)] bg-[rgba(255,255,255,0.03)] p-4 text-left">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">Quick add offer</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={newOffer.name}
                    onChange={(event) => setNewOffer((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Offer name"
                    className="hud-input"
                  />
                  <input
                    value={newOffer.affiliate_link}
                    onChange={(event) => setNewOffer((prev) => ({ ...prev, affiliate_link: event.target.value }))}
                    placeholder="https://offer-url.example"
                    className="hud-input"
                  />
                  <input
                    value={newOffer.description}
                    onChange={(event) => setNewOffer((prev) => ({ ...prev, description: event.target.value }))}
                    placeholder="Short offer summary"
                    className="hud-input md:col-span-2"
                  />
                </div>
                <button
                  type="button"
                  onClick={createOfferInline}
                  disabled={creatingOfferInline}
                  className="hud-button-secondary mt-3 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creatingOfferInline ? 'Creating offer...' : 'Create Offer'}
                </button>
              </div>

              <div className="rounded-lg border border-emerald-300/35 bg-emerald-500/10 p-4 text-left">
                <p className="text-xs text-emerald-100">
                  Selected offer: <strong>{selectedOffer?.name || 'None'}</strong>
                </p>
                <button
                  type="button"
                  onClick={attachSelectedOfferToFunnel}
                  disabled={!selectedOffer || attachingOffer || !createdFunnel}
                  className="btn-launch-premium mt-3 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {attachingOffer ? 'Attaching offer...' : offerAttached ? 'Offer Attached' : 'Attach Offer to Funnel CTA'}
                </button>
              </div>
            </div>
          )}

          {step.id === 'email' && (
            <div className="mb-8 rounded-lg border border-[var(--border-elevated)] bg-[rgba(255,255,255,0.04)] p-6">
              <p className="text-sm text-text-secondary mb-4">
                This provisions default automation sequences on your account so new leads receive follow-up immediately.
              </p>
              <div className="text-left space-y-2 mb-4">
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

              <button
                type="button"
                onClick={enableEmailAutomation}
                disabled={provisioningEmail}
                className="btn-launch-premium px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {provisioningEmail ? 'Enabling automations...' : emailAutomationReady ? 'Email Automation Enabled' : 'Enable Email Automation'}
              </button>
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
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <CheckCircle size={16} className="text-emerald-300" />
                  <span>Preview URL: <strong>{getPublicFunnelPath() || 'Not available yet'}</strong></span>
                </div>
              </div>
              <div className="mb-4 rounded-lg border border-cyan-300/35 bg-cyan-500/10 p-4 text-left">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">Step 4.5 Quick Checklist</p>
                <p className="mt-1 text-xs text-cyan-50">
                  Run this before publish. It validates that your public page loads and your CTA tracking redirect responds.
                </p>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between rounded border border-cyan-300/25 px-3 py-2">
                    <span className="text-cyan-50">Preview route returns 200</span>
                    <span className={launchChecks.previewOk ? 'text-emerald-200' : 'text-amber-200'}>
                      {launchChecks.previewOk ? 'Pass' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded border border-cyan-300/25 px-3 py-2">
                    <span className="text-cyan-50">CTA redirect returns 3xx</span>
                    <span className={launchChecks.ctaOk ? 'text-emerald-200' : 'text-amber-200'}>
                      {launchChecks.ctaOk ? 'Pass' : 'Pending'}
                    </span>
                  </div>
                </div>
                {launchChecks.lastRunAt && (
                  <p className="mt-2 text-xs text-cyan-100/85">Last run: {new Date(launchChecks.lastRunAt).toLocaleString()}</p>
                )}
                <button
                  type="button"
                  onClick={runLaunchChecks}
                  disabled={launchChecksRunning || !offerAttached || !emailAutomationReady || !createdFunnel}
                  className="hud-button-secondary mt-3 rounded-lg px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {launchChecksRunning ? 'Running checks...' : 'Run Step 4.5 Checks'}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {getPublicFunnelPath() ? (
                  <a
                    href={getPublicFunnelPath()}
                    target="_blank"
                    rel="noreferrer"
                    className="hud-button-secondary rounded-lg px-4 py-2 text-sm"
                  >
                    Open Live Preview
                  </a>
                ) : (
                  <span className="rounded-lg border border-[var(--border-elevated)] px-4 py-2 text-sm text-text-secondary">
                    Preview URL pending
                  </span>
                )}
                <button
                  type="button"
                  onClick={publishCreatedFunnel}
                  disabled={publishingFunnel || !createdFunnel || !launchChecks.previewOk || !launchChecks.ctaOk}
                  className="btn-launch-premium rounded-lg px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {publishingFunnel ? 'Publishing...' : funnelPublished ? 'Published' : 'Publish Funnel'}
                </button>
              </div>
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
                disabled={isNextDisabled}
                className="btn-launch-premium inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition hover:shadow-lg"
              >
                {creatingTemplate || attachingOffer || provisioningEmail || publishingFunnel || launchChecksRunning
                  ? 'Working...'
                  : currentStep < launchSteps.length - 1
                    ? 'Next'
                    : step.action}
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
      <LaunchpadCopilotAssist context={copilotContext} onJumpToStep={jumpToCopilotStep} />
    </div>
  )
}
