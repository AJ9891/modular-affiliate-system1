'use client'

import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Brain, Mail, Rocket, ShieldCheck, Terminal } from 'lucide-react'
import { LaunchpadVision } from '@/components/LaunchpadVision'
import { loadVisionContext } from '@/features/vision/api/vision.repository'
import { VISION_ACTION_DEFINITIONS } from '@/features/vision/domain/vision.recommendations'
import type { VisionAction, VisionContext, VisionStat } from '@/features/vision/domain/vision.types'

const actionPresentation = {
  'build-funnel': { icon: Rocket, accent: 'cyan' }, 'view-analytics': { icon: BarChart3, accent: 'blue' },
  'optimize-funnel': { icon: Brain, accent: 'amber' }, 'manage-offers': { icon: ShieldCheck, accent: 'cyan' },
  'configure-email': { icon: Mail, accent: 'purple' }, 'open-admin': { icon: Terminal, accent: 'blue' },
} as const

const actions: VisionAction[] = Object.entries(actionPresentation).map(([id, presentation]) => {
  const definition = VISION_ACTION_DEFINITIONS[id as keyof typeof actionPresentation]
  return { id: definition.actionId, label: definition.label, description: definition.description, href: definition.href, icon: presentation.icon, accent: presentation.accent }
})

function statsFrom(context: VisionContext): VisionStat[] {
  const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
  return [
    { label: 'Active Launchpads', value: `${context.launchpads.active}/${context.launchpads.capacity}`, hint: `${context.launchpads.drafts} drafts · ${context.launchpads.live} live` },
    { label: 'Visitors', value: context.performance.visitors.toLocaleString(), hint: 'Last 30 days' },
    { label: 'Revenue', value: currency.format(context.performance.revenue), hint: `${context.performance.conversions.toLocaleString()} conversions` },
    { label: 'Conversion Rate', value: `${context.performance.conversionRate.toFixed(2)}%`, hint: 'Tracked funnel performance' },
  ]
}

export default function VisionPreviewPage() {
  const [context, setContext] = useState<VisionContext | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => { loadVisionContext(window.location.pathname).then(setContext).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Vision context could not be loaded.')) }, [])
  const stats = useMemo(() => context ? statsFrom(context) : [], [context])

  if (error) return <main className="min-h-screen bg-[#0a0f1d] p-10 text-slate-100"><h1 className="text-2xl font-semibold">Vision needs platform context</h1><p className="mt-3 text-slate-300">{error}</p></main>
  if (!context) return <main className="min-h-screen bg-[#0a0f1d] p-10 text-cyan-100">Reading your Launchpads and performance…</main>
  return <LaunchpadVision stats={stats} actions={actions} context={context} />
}
