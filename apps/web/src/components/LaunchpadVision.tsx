import React from 'react'
import { cn } from '@/lib/utils'
import {
  Brain,
  Rocket,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Compass,
  Terminal,
  Radio,
  Workflow,
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
  cyan: 'from-cyan-500/40 to-cyan-400/10 border-cyan-400/60 shadow-cyan-400/50',
  blue: 'from-blue-500/40 to-blue-400/10 border-blue-400/60 shadow-blue-400/50',
  purple: 'from-purple-500/40 to-purple-400/10 border-purple-400/60 shadow-purple-400/50',
  amber: 'from-amber-500/40 to-amber-400/10 border-amber-400/60 shadow-amber-400/50',
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1d] via-[#0c1224] to-[#0f172a] text-slate-100">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 space-y-10">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/60 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-100/80 bg-cyan-400/10">
              <Radio size={14} className="text-cyan-300" />
              Launchpad 4 Vision • Codex Copilot
            </div>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-white">
              Command the platform from your cockpit
            </h1>
            <p className="mt-2 text-slate-300">
              Neon-dark UI with Codex-aware controls. Hover to illuminate, click to jump into platform modules.
            </p>
          </div>
          <div className="flex gap-3">
            <StatusPill label="Live Link" value="Secure" tone="cyan" />
            {userPlan ? <StatusPill label="Plan" value={userPlan} tone="purple" /> : null}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Vision grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlowCard className="col-span-1 lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm uppercase tracking-[0.12em] text-cyan-200">
                <Compass size={16} /> Navigation Console
              </div>
              <Badge>Codex Online</Badge>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {actions.map((action) => {
                const Icon = action.icon
                return (
                  <a
                    key={action.title}
                    href={action.href}
                    className={cn(
                      'group relative block rounded-xl border border-white/5 p-4 transition-all duration-200',
                      'hover:border-cyan-400/60 hover:shadow-[0_0_30px_-12px_rgba(56,189,248,0.6)]',
                      'bg-gradient-to-br',
                      accentMap[action.accent]
                    )}
                  >
                    <Icon className="mb-3 h-6 w-6 text-white drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
                    <div className="text-white font-semibold">{action.title}</div>
                    <div className="text-xs text-slate-200/80 mt-1 leading-relaxed">{action.description}</div>
                    <div className="mt-3 flex items-center gap-2 text-[11px] uppercase tracking-wide text-cyan-100/90">
                      Engage
                      <ArrowPulse />
                    </div>
                  </a>
                )
              })}
            </div>
          </GlowCard>

          <GlowCard className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm uppercase tracking-[0.14em] text-purple-200">
                <Brain size={16} /> Codex Briefing
              </div>
              <Badge tone="purple">Live</Badge>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              Codex monitors funnels, emails, and affiliates. It surfaces weak spots and suggests actions before
              metrics slip. Hover any module to get context, click to open the platform page with pre-loaded intent.
            </p>
            <div className="mt-4 space-y-2 text-xs text-slate-300/80">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-300" />
                Real-time guardrails (auth, rate, anomaly).
              </div>
              <div className="flex items-center gap-2">
                <Workflow size={14} className="text-cyan-300" />
                One-click workflows: build → preview → launch.
              </div>
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-blue-300" />
                Codex commands: prefill forms & jump to steps.
              </div>
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
  const color = tone === 'cyan' ? 'text-cyan-200 bg-cyan-500/10 border-cyan-400/40' : 'text-purple-200 bg-purple-500/10 border-purple-400/40'
  return (
    <div className={cn('rounded-full border px-4 py-2 text-sm font-medium shadow-inner shadow-black/30', color)}>
      <span className="uppercase tracking-[0.18em] text-xs text-white/70">{label}</span>
      <div className="text-white">{value}</div>
    </div>
  )
}

function ArrowPulse() {
  return (
    <span className="inline-flex items-center gap-1 text-cyan-100">
      <span className="h-[1px] w-6 bg-gradient-to-r from-transparent via-cyan-300 to-transparent animate-pulse" />
    </span>
  )
}

LaunchpadVision.defaultProps = {
  actions: [
    {
      title: 'Visual Funnel Builder',
      description: 'Drag blocks, see live preview, publish instantly.',
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
      title: 'Analytics',
      description: 'Conversion, revenue, and email telemetry overlays.',
      href: '/analytics',
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
  ],
}
