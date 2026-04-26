'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { useBrandMode, type BrandModeKey } from '@/contexts/BrandModeContext'
import { CANONICAL_PERSONALITIES } from '@/lib/personality/canonical-definitions'
import {
  ArrowUpRight,
  Radio,
  Send,
  Sparkles,
} from 'lucide-react'

type Stat = {
  label: string
  value: string
  hint?: string
}

type Action = {
  title: string
  description: string
  href: string
  icon: React.ElementType
  accent: 'cyan' | 'blue' | 'purple' | 'amber'
}

interface LaunchpadVisionProps {
  stats: Stat[]
  actions: Action[]
  userPlan?: string
}

const accentMap: Record<Action['accent'], string> = {
  cyan: 'border-cyan-400/60 bg-cyan-500/10 text-cyan-100',
  blue: 'border-blue-400/60 bg-blue-500/10 text-blue-100',
  purple: 'border-purple-400/60 bg-purple-500/10 text-purple-100',
  amber: 'border-amber-400/60 bg-amber-500/10 text-amber-100',
}

type ChatMessage = {
  id: string
  role: 'user' | 'system'
  content: string
  actionLabel?: string
  actionHref?: string
}

const QUICK_PROMPTS = [
  'Where should I start right now?',
  'Show me the best module for more conversions.',
  'I need help with affiliate payouts.',
  'Take me to analytics.',
]

const MODE_TO_PERSONALITY = {
  rocket: CANONICAL_PERSONALITIES.boost,
  antiguru: CANONICAL_PERSONALITIES.anchor,
  meltdown: CANONICAL_PERSONALITIES.glitch,
} as const

const MODE_LABEL: Record<BrandModeKey, string> = {
  rocket: 'Rocket Future',
  antiguru: 'Anti-Guru',
  meltdown: 'AI Meltdown',
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function hashSeed(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function pickPhrase(phrases: readonly string[], seed: string, fallback: string): string {
  if (phrases.length === 0) return fallback
  return phrases[hashSeed(seed) % phrases.length] ?? fallback
}

function createInitialMessage(stats: Stat[], mode: BrandModeKey, userPlan?: string): ChatMessage {
  const personality = MODE_TO_PERSONALITY[mode]
  const leadStat = stats[0]
  const planText = userPlan ? `${userPlan} plan detected.` : 'Plan not detected.'
  const statText = leadStat ? `${leadStat.label}: ${leadStat.value}.` : 'No stats loaded yet.'
  const greeting = pickPhrase(personality.language.greetings, `${mode}-intro-greeting`, 'System online.')
  const transition = pickPhrase(personality.language.transitions, `${mode}-intro-transition`, 'Current state:')
  return {
    id: makeId(),
    role: 'system',
    content: `${greeting} ${transition} ${planText} ${statText} Share your goal and I will route you to the right module.`,
  }
}

function resolveActionFromPrompt(prompt: string, actions: Action[]): Action | null {
  const lower = prompt.toLowerCase()
  const map: Array<{ keys: string[]; title: string }> = [
    { keys: ['start', 'build', 'funnel', 'page'], title: 'Visual Funnel Builder' },
    { keys: ['ai', 'copy', 'headline', 'content'], title: 'AI Generator' },
    { keys: ['radar', 'analytics', 'metric', 'traffic'], title: 'Radar Module' },
    { keys: ['optimize', 'optimizer', 'conversion', 'ab test', 'a/b'], title: 'Optimizer' },
    { keys: ['affiliate', 'commission', 'payout', 'offer'], title: 'Affiliate HQ' },
    { keys: ['admin', 'users', 'roles', 'logs'], title: 'Admin' },
  ]

  for (const item of map) {
    if (item.keys.some((key) => lower.includes(key))) {
      return actions.find((action) => action.title === item.title) ?? null
    }
  }

  return null
}

function buildSystemReply(prompt: string, stats: Stat[], actions: Action[], mode: BrandModeKey): ChatMessage {
  const personality = MODE_TO_PERSONALITY[mode]
  const transition = pickPhrase(personality.language.transitions, `${mode}-transition-${prompt}`, 'Recommended module:')
  const emphasis = pickPhrase(personality.language.emphasis, `${mode}-emphasis-${prompt}`, 'Focus on execution.')
  const closing = pickPhrase(personality.language.closings, `${mode}-closing-${prompt}`, 'Continue when ready.')
  const matchedAction = resolveActionFromPrompt(prompt, actions)
  if (matchedAction) {
    const contentByMode: Record<BrandModeKey, string> = {
      rocket: `${transition} ${matchedAction.title}. ${matchedAction.description} ${emphasis}. ${closing}`,
      antiguru: `${transition}. ${matchedAction.title} is the right move. ${matchedAction.description} ${emphasis}.`,
      meltdown: `${transition} ${matchedAction.title}. ${matchedAction.description} ${emphasis}. ${closing}`,
    }

    return {
      id: makeId(),
      role: 'system',
      content: contentByMode[mode],
      actionLabel: `Open ${matchedAction.title}`,
      actionHref: matchedAction.href,
    }
  }

  const bestStat = getBestStat(stats)
  const fallbackByMode: Record<BrandModeKey, string> = {
    rocket: `${transition} I did not find a direct module match yet. Strongest signal is ${bestStat}. ${emphasis}. Tell me your target outcome (build, traffic, conversion, affiliate, or admin).`,
    antiguru: `${transition}. No direct module match from that prompt. Strongest signal is ${bestStat}. ${emphasis}. Give me one concrete target: build, traffic, conversion, affiliate, or admin.`,
    meltdown: `${transition} I did not find a direct module match. Strongest signal is ${bestStat}. ${emphasis}. Pick one target outcome: build, traffic, conversion, affiliate, or admin.`,
  }

  return {
    id: makeId(),
    role: 'system',
    content: fallbackByMode[mode],
  }
}

function getBestStat(stats: Stat[]): string {
  if (stats.length === 0) return 'no stats available'
  const candidate = stats.find((stat) => stat.hint?.includes('+')) ?? stats[0]
  return `${candidate.label}: ${candidate.value}`
}

function GlowCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 shadow-[0_0_35px_-15px_rgba(0,204,255,0.45)] backdrop-blur-md',
        'transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_0_45px_-10px_rgba(56,189,248,0.65)]',
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(124,58,237,0.12),transparent_30%)]" />
      <div className="relative">{children}</div>
    </div>
  )
}

export function LaunchpadVision({ stats, actions, userPlan }: LaunchpadVisionProps) {
  const { mode } = useBrandMode()
  const [messages, setMessages] = useState<ChatMessage[]>(() => [createInitialMessage(stats, mode, userPlan)])
  const [draft, setDraft] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)

  const statSummary = useMemo(
    () => stats.map((stat) => `${stat.label}: ${stat.value}`).join(' · '),
    [stats]
  )

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  const submitPrompt = (rawPrompt: string) => {
    const prompt = rawPrompt.trim()
    if (!prompt || isThinking) return

    const userMessage: ChatMessage = { id: makeId(), role: 'user', content: prompt }
    setMessages((current) => [...current, userMessage])
    setDraft('')
    setIsThinking(true)

    window.setTimeout(() => {
      const systemReply = buildSystemReply(prompt, stats, actions, mode)
      setMessages((current) => [...current, systemReply])
      setIsThinking(false)
    }, 220)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1d] via-[#0c1224] to-[#0f172a] text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/60 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-100/80 bg-cyan-400/10">
              <Radio size={14} className="text-cyan-300" />
              Vision Module • User/System Chat
            </div>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-white">
              Talk to the system, route by intent
            </h1>
            <p className="mt-2 text-slate-300">
              Tell the system your goal. It responds with the right module and a direct jump link.
            </p>
          </div>
          <div className="flex gap-3">
            <StatusPill label="Live Link" value="Secure" tone="cyan" />
            {userPlan ? <StatusPill label="Plan" value={userPlan} tone="purple" /> : null}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <GlowCard key={stat.label} className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm uppercase tracking-wide text-slate-400">{stat.label}</span>
                <Sparkles size={16} className="text-cyan-300" />
              </div>
              <div className="mt-3 text-3xl font-semibold text-white">{stat.value}</div>
              {stat.hint ? <div className="mt-1 text-xs text-slate-400">{stat.hint}</div> : null}
            </GlowCard>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <GlowCard className="p-6 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm uppercase tracking-[0.12em] text-cyan-200">
                <Sparkles size={16} /> Chat Console
              </div>
              <Badge>{MODE_LABEL[mode]}</Badge>
            </div>

            <div className="h-[440px] overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[88%] rounded-2xl border px-4 py-3 text-sm leading-relaxed',
                        message.role === 'user'
                          ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-50'
                          : 'border-purple-400/40 bg-purple-500/10 text-slate-100'
                      )}
                    >
                      <div className="mb-1 text-[10px] uppercase tracking-[0.14em] text-white/65">
                        {message.role === 'user' ? 'User' : 'System'}
                      </div>
                      <div>{message.content}</div>
                      {message.actionHref && message.actionLabel ? (
                        <a
                          href={message.actionHref}
                          className="mt-3 inline-flex items-center gap-1 rounded-full border border-cyan-300/50 px-3 py-1.5 text-xs font-medium text-cyan-100 transition hover:bg-cyan-400/15"
                        >
                          {message.actionLabel}
                          <ArrowUpRight size={12} />
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))}
                {isThinking ? (
                  <div className="flex justify-start">
                    <div className="rounded-2xl border border-purple-400/40 bg-purple-500/10 px-4 py-3 text-sm text-slate-100">
                      <div className="mb-1 text-[10px] uppercase tracking-[0.14em] text-white/65">System</div>
                      <span className="animate-pulse">Thinking...</span>
                    </div>
                  </div>
                ) : null}
                <div ref={endRef} />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => submitPrompt(prompt)}
                  className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-slate-200 transition hover:border-cyan-300/60 hover:text-cyan-100"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form
              className="mt-4 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                submitPrompt(draft)
              }}
            >
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Message the system..."
                className="flex-1 rounded-xl border border-white/15 bg-[#0b1222] px-4 py-3 text-sm text-slate-100 outline-none ring-cyan-300/50 placeholder:text-slate-400 focus:ring-2"
              />
              <button
                type="submit"
                disabled={!draft.trim() || isThinking}
                className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/60 bg-cyan-500/20 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Send
                <Send size={14} />
              </button>
            </form>
          </GlowCard>

          <GlowCard className="p-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm uppercase tracking-[0.14em] text-purple-200">
                <Sparkles size={16} /> System Briefing
              </div>
              <Badge tone="purple">Live</Badge>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              System context: {statSummary || 'No stats available'}.
            </p>
            <div className="mt-4 space-y-3">
              {actions.map((action) => {
                const Icon = action.icon
                return (
                  <a
                    key={action.title}
                    href={action.href}
                    className={cn(
                      'flex items-start gap-3 rounded-lg border px-3 py-2 text-xs transition hover:brightness-110',
                      accentMap[action.accent]
                    )}
                  >
                    <Icon size={14} className="mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold">{action.title}</div>
                      <div className="opacity-80">{action.description}</div>
                    </div>
                  </a>
                )
              })}
            </div>
          </GlowCard>
        </div>
      </div>
    </div>
  )
}

function Badge({ children, tone = 'cyan' }: { children: React.ReactNode; tone?: 'cyan' | 'purple' }) {
  const styles =
    tone === 'purple'
      ? 'bg-purple-500/20 text-purple-100 border border-purple-400/50'
      : 'bg-cyan-500/20 text-cyan-100 border border-cyan-400/50'
  return <span className={cn('rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.12em]', styles)}>{children}</span>
}

function StatusPill({ label, value, tone }: { label: string; value: string; tone: 'cyan' | 'purple' }) {
  const color =
    tone === 'cyan'
      ? 'text-cyan-200 bg-cyan-500/10 border-cyan-400/40'
      : 'text-purple-200 bg-purple-500/10 border-purple-400/40'
  return (
    <div className={cn('rounded-full border px-4 py-2 text-sm font-medium shadow-inner shadow-black/30', color)}>
      <span className="uppercase tracking-[0.18em] text-xs text-white/70">{label}</span>
      <div className="text-white">{value}</div>
    </div>
  )
}

LaunchpadVision.defaultProps = {
  actions: [
    {
      title: 'Visual Funnel Builder',
      description: 'Drag blocks, see live preview, publish instantly.',
      href: '/visual-builder',
      icon: Sparkles,
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
      icon: Sparkles,
      accent: 'blue' as const,
    },
    {
      title: 'Optimizer',
      description: 'Autotune steps, run A/Bs, enforce guardrails.',
      href: '/ai-optimizer',
      icon: Sparkles,
      accent: 'amber' as const,
    },
    {
      title: 'Affiliate HQ',
      description: 'Links, commissions, fraud checks, payouts.',
      href: '/offers',
      icon: Sparkles,
      accent: 'cyan' as const,
    },
    {
      title: 'Admin',
      description: 'Users, roles, system logs, feature flags.',
      href: '/admin',
      icon: Sparkles,
      accent: 'blue' as const,
    },
  ],
}
