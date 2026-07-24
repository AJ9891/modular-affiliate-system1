'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpRight, Radio, Send, Sparkles } from 'lucide-react'
import { useBrandMode, type BrandModeKey } from '@/contexts/BrandModeContext'
import { attachVisionContext, VISION_ACTION_DEFINITIONS } from '@/features/vision/domain/vision.recommendations'
import type { VisionAction, VisionContext, VisionStat } from '@/features/vision/domain/vision.types'
import { useVision } from '@/features/vision/hooks/useVision'
import { cn } from '@/lib/utils'

type Props = { stats: VisionStat[]; actions: VisionAction[]; context: VisionContext }

const QUICK_PROMPTS = ['Where should I start right now?', 'Show me the best module for more conversions.', 'I need help with affiliate payouts.', 'Take me to analytics.']
const MODE_LABEL: Record<BrandModeKey, string> = { rocket: 'Rocket Future', antiguru: 'Anti-Guru', meltdown: 'AI Meltdown' }
const accentMap: Record<VisionAction['accent'], string> = {
  cyan: 'border-cyan-400/60 bg-cyan-500/10 text-cyan-100', blue: 'border-blue-400/60 bg-blue-500/10 text-blue-100',
  purple: 'border-purple-400/60 bg-purple-500/10 text-purple-100', amber: 'border-amber-400/60 bg-amber-500/10 text-amber-100',
}

function GlowCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 shadow-[0_0_35px_-15px_rgba(0,204,255,0.45)] backdrop-blur-md transition-transform duration-200 hover:-translate-y-1', className)}><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(124,58,237,0.12),transparent_30%)]" /><div className="relative">{children}</div></div>
}

export function LaunchpadVision({ stats, actions, context }: Props) {
  const { mode } = useBrandMode()
  const { messages, isThinking, submit, recommendation } = useVision(context, mode)
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement | null>(null)
  const statSummary = useMemo(() => stats.map((stat) => `${stat.label}: ${stat.value}`).join(' · '), [stats])
  const bestAction = VISION_ACTION_DEFINITIONS[recommendation.actionId]

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isThinking])
  const send = (prompt: string) => { submit(prompt); setDraft('') }

  return <div className="min-h-screen bg-gradient-to-br from-[#0a0f1d] via-[#0c1224] to-[#0f172a] text-slate-100">
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div><div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/60 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-100/80"><Radio size={14} /> Vision · Decision Intelligence</div>
          <h1 className="mt-4 text-4xl font-semibold text-white">Understand, recommend, and route</h1>
          <p className="mt-2 text-slate-300">Vision reads your platform state and attaches Launchpad or funnel context to every recommended move.</p></div>
        <div className="flex gap-3"><StatusPill label="Context" value="Live" tone="cyan" /><StatusPill label="Plan" value={context.user.plan} tone="purple" /></div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">{stats.map((stat) => <GlowCard key={stat.label} className="p-5"><div className="flex items-center justify-between"><span className="text-sm uppercase tracking-wide text-slate-400">{stat.label}</span><Sparkles size={16} className="text-cyan-300" /></div><div className="mt-3 text-3xl font-semibold text-white">{stat.value}</div>{stat.hint ? <div className="mt-1 text-xs text-slate-400">{stat.hint}</div> : null}</GlowCard>)}</div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GlowCard className="p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2 text-sm uppercase tracking-[0.12em] text-cyan-200"><Sparkles size={16} /> Chat Console</div><Badge>{MODE_LABEL[mode]}</Badge></div>
          <div className="h-[440px] overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-4"><div className="space-y-3">
            {messages.map((message) => <div key={message.id} className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}><div className={cn('max-w-[88%] rounded-2xl border px-4 py-3 text-sm leading-relaxed', message.role === 'user' ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-50' : 'border-purple-400/40 bg-purple-500/10 text-slate-100')}><div className="mb-1 text-[10px] uppercase tracking-[0.14em] text-white/65">{message.role === 'user' ? 'User' : 'Vision'}</div><div>{message.content}</div>{message.actionHref && message.actionLabel ? <a href={message.actionHref} className="mt-3 inline-flex items-center gap-1 rounded-full border border-cyan-300/50 px-3 py-1.5 text-xs font-medium text-cyan-100 hover:bg-cyan-400/15">{message.actionLabel}<ArrowUpRight size={12} /></a> : null}</div></div>)}
            {isThinking ? <div className="flex justify-start"><div className="animate-pulse rounded-2xl border border-purple-400/40 bg-purple-500/10 px-4 py-3 text-sm">Reading platform state…</div></div> : null}<div ref={endRef} />
          </div></div>
          <div className="mt-4 flex flex-wrap gap-2">{QUICK_PROMPTS.map((prompt) => <button key={prompt} type="button" onClick={() => send(prompt)} className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-slate-200 hover:border-cyan-300/60">{prompt}</button>)}</div>
          <form className="mt-4 flex gap-2" onSubmit={(event) => { event.preventDefault(); send(draft) }}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="What are you trying to accomplish?" className="flex-1 rounded-xl border border-white/15 bg-[#0b1222] px-4 py-3 text-sm outline-none focus:ring-2" /><button type="submit" disabled={!draft.trim() || isThinking} className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/60 bg-cyan-500/20 px-4 py-3 text-sm disabled:opacity-60">Send <Send size={14} /></button></form>
        </GlowCard>

        <GlowCard className="p-6"><div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2 text-sm uppercase tracking-[0.14em] text-purple-200"><Sparkles size={16} /> System Briefing</div><Badge tone="purple">Live</Badge></div>
          <p className="text-sm leading-relaxed text-slate-200">{statSummary || 'No stats available'}.</p>
          <a href={attachVisionContext(bestAction.href, context, recommendation)} className="mt-4 block rounded-lg border border-amber-400/60 bg-amber-500/10 p-3 text-xs text-amber-100"><div className="font-semibold">Recommended: {bestAction.label}</div><div className="mt-1 opacity-80">{recommendation.reason}</div></a>
          <div className="mt-4 space-y-3">{actions.map((action) => { const Icon = action.icon; return <a key={action.id} href={attachVisionContext(action.href, context)} className={cn('flex items-start gap-3 rounded-lg border px-3 py-2 text-xs hover:brightness-110', accentMap[action.accent])}><Icon size={14} className="mt-0.5 shrink-0" /><div><div className="font-semibold">{action.label}</div><div className="opacity-80">{action.description}</div></div></a> })}</div>
        </GlowCard>
      </div>
    </div>
  </div>
}

function Badge({ children, tone = 'cyan' }: { children: React.ReactNode; tone?: 'cyan' | 'purple' }) { return <span className={cn('rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.12em]', tone === 'purple' ? 'border-purple-400/50 bg-purple-500/20 text-purple-100' : 'border-cyan-400/50 bg-cyan-500/20 text-cyan-100')}>{children}</span> }
function StatusPill({ label, value, tone }: { label: string; value: string; tone: 'cyan' | 'purple' }) { return <div className={cn('rounded-full border px-4 py-2 text-sm font-medium capitalize', tone === 'cyan' ? 'border-cyan-400/40 bg-cyan-500/10 text-cyan-200' : 'border-purple-400/40 bg-purple-500/10 text-purple-200')}><span className="text-xs uppercase tracking-[0.18em] text-white/70">{label}</span><div className="text-white">{value}</div></div> }
