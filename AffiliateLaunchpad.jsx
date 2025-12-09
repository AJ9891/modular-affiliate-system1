import React, { useState, useEffect } from 'react'
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

/**
 * AffiliateLaunchpad - Unified Launch Dashboard
 * 
 * This component combines the best features from both systems:
 * - Simple, guided launch workflow
 * - Quick-start funnel templates
 * - Integrated analytics dashboard
 * - Email automation setup
 * - AI-powered content generation
 * 
 * Features:
 * 1. Step-by-step onboarding
 * 2. Quick funnel builder with templates
 * 3. One-click email setup
 * 4. Real-time performance tracking
 * 5. AI content assistant
 */
export default function AffiliateLaunchpad() {
  const [currentStep, setCurrentStep] = useState(0)
  const [setupComplete, setSetupComplete] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [stats, setStats] = useState({
    funnels: 0,
    leads: 0,
    revenue: 0,
    conversions: 0
  })

  useEffect(() => {
    // Load user profile and stats
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      // Check if user exists and has completed setup
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data.user)
        
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
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
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

  const handleStepComplete = async (stepId) => {
    // Mark step as complete and move to next
    if (stepId === 'launch') {
      setSetupComplete(true)
      await loadUserData()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const createFunnelFromTemplate = async (template) => {
    try {
      const response = await fetch('/api/funnels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: template.name,
          template: template.category
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        window.location.href = `/visual-builder?funnelId=${data.funnelId}`
      }
    } catch (error) {
      console.error('Failed to create funnel:', error)
    }
  }

  if (setupComplete || stats.funnels > 0) {
    // Show main dashboard for returning users
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome Back! 🚀
            </h1>
            <p className="text-xl text-gray-600">
              Your affiliate empire is growing. Here's what's happening.
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
              <div className="text-3xl font-bold">{stats.leads.toLocaleString()}</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Revenue</span>
                <DollarSign className="text-purple-500" size={24} />
              </div>
              <div className="text-3xl font-bold">${stats.revenue.toLocaleString()}</div>
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
              {quickActions.map((action, index) => (
                <a
                  key={index}
                  href={action.href}
                  className={`
                    bg-gradient-to-br ${action.color} 
                    text-white rounded-xl shadow-lg p-6 
                    hover:shadow-2xl transition-all transform hover:-translate-y-1
                  `}
                >
                  <action.icon className="mb-4" size={32} />
                  <h3 className="font-bold text-lg mb-2">{action.title}</h3>
                  <p className="text-sm opacity-90">{action.description}</p>
                </a>
              ))}
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

  // Show onboarding for new users
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

          {step.id === 'funnel' && (
            <div className="grid grid-cols-2 gap-4 mb-8">
              {funnelTemplates.slice(0, 4).map((template, index) => (
                <div
                  key={index}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-all"
                  onClick={() => createFunnelFromTemplate(template)}
                >
                  <h4 className="font-bold mb-1">{template.name}</h4>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </div>
              ))}
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
            {step.action}
            <ArrowRight size={20} />
          </button>

          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
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