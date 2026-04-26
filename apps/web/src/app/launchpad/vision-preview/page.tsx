'use client'

import { LaunchpadVision } from '@/components/LaunchpadVision'
import { Sparkles, Rocket, BarChart3, ShieldCheck, Brain, Terminal } from 'lucide-react'

const mockStats = [
  { label: 'Active Funnels', value: '12', hint: '3 launched this week' },
  { label: 'Leads', value: '18,420', hint: '+6.4% vs last 7d' },
  { label: 'Revenue', value: '$128,900', hint: 'MRR · Stripe synced' },
  { label: 'Conversions', value: '4.9%', hint: 'Across all funnels' },
]

const mockActions = [
  {
    title: 'Visual Funnel Builder',
    description: 'Drag blocks, preview live, publish instantly.',
    href: '/visual-builder',
    icon: Rocket,
    accent: 'cyan' as const,
  },
  {
    title: 'AI Generator',
    description: 'Codex writes hero, email, and CTA copy to match intent.',
    href: '/ai-generator',
    icon: Sparkles,
    accent: 'purple' as const,
  },
  {
    title: 'Radar Module',
    description: 'Open cockpit to access the radar module.',
    href: '/cockpit',
    icon: BarChart3,
    accent: 'blue' as const,
  },
  {
    title: 'Optimizer',
    description: 'Autotune steps, run A/Bs, enforce guardrails.',
    href: '/ai-optimizer',
    icon: Brain,
    accent: 'amber' as const,
  },
  {
    title: 'Affiliate HQ',
    description: 'Links, commissions, fraud checks, payouts.',
    href: '/offers',
    icon: ShieldCheck,
    accent: 'cyan' as const,
  },
  {
    title: 'Admin',
    description: 'Users, roles, system logs, feature flags.',
    href: '/admin',
    icon: Terminal,
    accent: 'blue' as const,
  },
]

export default function VisionPreviewPage() {
  return <LaunchpadVision stats={mockStats} actions={mockActions} userPlan="Pro" />
}
