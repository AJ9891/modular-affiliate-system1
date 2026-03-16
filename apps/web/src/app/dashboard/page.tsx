'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

type VoiceMode = 'anchor' | 'glitch' | 'rocket'

type CockpitModule = {
  id: string
  title: string
  label: string
  description: string
  href: string
  x: number
  y: number
  rgb: string
}

type BrandBrainProfile = {
  brand_name?: string | null
  archetype?: string | null
  voice_tone?: string | null
  mode?: string | null
  brand_mode?: string | null
  ui_expression_profile?: {
    hero?: {
      variants?: string[]
    }
  } | null
}

const MODULES: CockpitModule[] = [
  {
    id: 'radar',
    title: 'RADAR',
    label: 'REAL-TIME ANALYTICS',
    description: 'Low-latency event monitoring, conversion tracking, and performance visualization.',
    href: '/analytics',
    x: 15,
    y: 16,
    rgb: '248,113,113',
  },
  {
    id: 'navigation',
    title: 'NAVIGATION',
    label: 'DOMAIN ROUTING SYSTEM',
    description: 'Custom domain routing, SSL mapping, and traffic direction control.',
    href: '/domains',
    x: 50,
    y: 19,
    rgb: '96,165,250',
  },
  {
    id: 'vision',
    title: 'LAUNCHPAD 4 VISION',
    label: 'AI COPILOT CONSOLE',
    description: 'Open Vision in working mode, then expand to command mode for full strategic control.',
    href: '/ai-generator',
    x: 85,
    y: 16,
    rgb: '167,139,250',
  },
  {
    id: 'fuel',
    title: 'FUEL',
    label: 'STRIPE SUBSCRIPTIONS',
    description: 'Recurring billing, subscriptions, and payment operations.',
    href: '/subscription',
    x: 15,
    y: 52,
    rgb: '251,191,36',
  },
  {
    id: 'comms',
    title: 'COMMUNICATIONS',
    label: 'EMAIL AUTOMATION + SENDSHARK',
    description: 'Email capture, sequencing, and automated nurture flow delivery.',
    href: '/downloads',
    x: 50,
    y: 79,
    rgb: '52,211,153',
  },
  {
    id: 'propulsion',
    title: 'PROPULSION',
    label: 'CONVERSION ENGINE',
    description: 'Funnel build system with optimization and launch workflows.',
    href: '/builder',
    x: 85,
    y: 52,
    rgb: '34,211,238',
  },
]

const VOICES: Array<{ id: VoiceMode; label: string; accentRgb: string; description: string; lineDash: string }> = [
  {
    id: 'anchor',
    label: 'ANCHOR',
    accentRgb: '124,140,255',
    description: 'Brutally honest guidance',
    lineDash: '1.6,1.8',
  },
  {
    id: 'glitch',
    label: 'GLITCH',
    accentRgb: '255,107,107',
    description: 'Sarcastic AI skepticism',
    lineDash: '0.8,1.0',
  },
  {
    id: 'rocket',
    label: 'ROCKET',
    accentRgb: '251,191,36',
    description: 'Encouraging forward momentum',
    lineDash: '2.4,1.2',
  },
]

function alpha(rgb: string, opacity: number) {
  return `rgba(${rgb}, ${opacity})`
}

function inferVoiceFromProfile(profile: BrandBrainProfile | null): VoiceMode {
  if (!profile) return 'anchor'

  const profileSignals = [
    profile.archetype,
    profile.voice_tone,
    profile.mode,
    profile.brand_mode,
    profile.ui_expression_profile?.hero?.variants?.join(' '),
    profile.brand_name,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (
    profileSignals.includes('ai_meltdown') ||
    profileSignals.includes('meltdown') ||
    profileSignals.includes('glitch') ||
    profileSignals.includes('sarcastic')
  ) {
    return 'glitch'
  }

  if (
    profileSignals.includes('rocket_future') ||
    profileSignals.includes('rocket') ||
    profileSignals.includes('boost') ||
    profileSignals.includes('encouraging')
  ) {
    return 'rocket'
  }

  return 'anchor'
}

export default function Dashboard() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [hoveredModuleId, setHoveredModuleId] = useState<string | null>(null)
  const [voice, setVoice] = useState<VoiceMode>('anchor')
  const [brandBrainName, setBrandBrainName] = useState<string | null>(null)
  const [brandBrainConnected, setBrandBrainConnected] = useState(false)
  const [visionMode, setVisionMode] = useState<'closed' | 'working' | 'command'>('closed')

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (!response.ok) {
          router.push('/login?redirect=/dashboard')
          return
        }

        const data = await response.json()
        setUserEmail(data?.user?.email ?? null)

        try {
          const brandBrainResponse = await fetch('/api/brand-brain?active=true')
          if (!brandBrainResponse.ok) return

          const brandBrainData = await brandBrainResponse.json()
          const activeProfile: BrandBrainProfile | null =
            Array.isArray(brandBrainData?.profiles) && brandBrainData.profiles.length > 0
              ? (brandBrainData.profiles[0] as BrandBrainProfile)
              : null

          if (!activeProfile) return

          setBrandBrainConnected(true)
          setBrandBrainName(activeProfile.brand_name ?? null)
          setVoice(inferVoiceFromProfile(activeProfile))
        } catch {
          // BrandBrain is optional for dashboard rendering.
        }
      } catch {
        router.push('/login?redirect=/dashboard')
      } finally {
        setLoading(false)
      }
    }

    bootstrap()
  }, [router])

  const activeModule = useMemo(
    () => MODULES.find((module) => module.id === hoveredModuleId) ?? null,
    [hoveredModuleId],
  )
  const activeVoice = useMemo(() => VOICES.find((candidate) => candidate.id === voice) ?? VOICES[0], [voice])
  const isVisionOpen = visionMode !== 'closed'
  const isVisionExpanded = visionMode === 'command'

  const openVision = () => {
    setVisionMode((current) => (current === 'command' ? current : 'working'))
  }

  const expandVision = () => {
    setVisionMode('command')
  }

  const collapseVision = () => {
    setVisionMode('working')
  }

  const closeVision = () => {
    setVisionMode('closed')
  }

  const handleLogout = () => {
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020913] text-slate-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-400" />
          <p className="text-slate-400">Loading cockpit...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020913] text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/Backgrounds/dashboard-dark.png"
          alt="Cockpit background"
          fill
          priority
          className="object-cover object-center opacity-85"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,185,255,0.24),transparent_56%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020913]/45 via-[#020913]/72 to-[#020913]/90" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1320px] flex-col px-4 pb-5 pt-4 lg:px-6">
        <header
          className="rounded-2xl bg-slate-950/55 px-4 py-4 backdrop-blur-md shadow-[0_0_30px_rgba(0,220,255,0.08)]"
          style={{ borderColor: alpha(activeVoice.accentRgb, 0.28), borderWidth: '1px', borderStyle: 'solid' }}
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-[0.08em] text-slate-100 lg:text-3xl">LAUNCHPAD 4 VISION</h1>
              <p className="mt-1 text-sm text-slate-400">Hidden module mode active. Hover cockpit coordinates to illuminate systems.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs">
                <p className="text-slate-400">VOICE</p>
                <div className="mt-2 flex items-center gap-1">
                  {VOICES.map((voiceOption) => (
                    <button
                      key={voiceOption.id}
                      type="button"
                      onClick={() => setVoice(voiceOption.id)}
                      aria-pressed={voiceOption.id === voice}
                      className="rounded px-2 py-1 text-[11px] font-semibold transition"
                      style={{
                        color: voiceOption.id === voice ? alpha(voiceOption.accentRgb, 1) : '#94a3b8',
                        borderColor: voiceOption.id === voice ? alpha(voiceOption.accentRgb, 0.85) : '#334155',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        backgroundColor: voiceOption.id === voice ? alpha(voiceOption.accentRgb, 0.15) : 'transparent',
                      }}
                    >
                      {voiceOption.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs">
                <p className="text-slate-400">BRANDBRAIN</p>
                <p className="font-semibold text-slate-200">{brandBrainConnected ? 'CONNECTED' : 'FALLBACK'}</p>
                <p className="text-slate-400">{brandBrainName ?? 'No active profile'}</p>
              </div>
              <div className="rounded-lg border border-cyan-400/25 bg-slate-900/80 px-3 py-2 text-xs">
                <p className="text-slate-400">OPERATOR</p>
                <p className="font-semibold text-cyan-300">{userEmail ?? 'operator@launchpad4success.pro'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-slate-600 px-3 py-2 text-xs text-slate-300 transition hover:border-cyan-400/60"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <section
          className="relative mt-4 flex-1 overflow-hidden rounded-2xl bg-slate-950/25 backdrop-blur-sm"
          style={{ borderColor: alpha(activeVoice.accentRgb, 0.25), borderWidth: '1px', borderStyle: 'solid' }}
        >
          <div className="pointer-events-none absolute inset-0">
            <svg className="h-full w-full opacity-25" viewBox="0 0 100 100" preserveAspectRatio="none">
              {MODULES.map((module) => (
                <line
                  key={`line-${module.id}`}
                  x1="50"
                  y1="50"
                  x2={module.x}
                  y2={module.y}
                  stroke={module.id === hoveredModuleId ? alpha(module.rgb, 0.78) : alpha(activeVoice.accentRgb, 0.17)}
                  strokeWidth={module.id === hoveredModuleId ? (voice === 'rocket' ? '0.70' : '0.55') : '0.23'}
                  strokeDasharray={module.id === hoveredModuleId ? activeVoice.lineDash : '1.3,2.0'}
                />
              ))}
            </svg>
          </div>

          {MODULES.map((module) => (
            <Link
              key={module.id}
              href={module.href}
              className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 outline-none"
              style={{ left: `${module.x}%`, top: `${module.y}%` }}
              onMouseEnter={() => setHoveredModuleId(module.id)}
              onMouseLeave={() => setHoveredModuleId((current) => (current === module.id ? null : current))}
              onFocus={() => setHoveredModuleId(module.id)}
              onBlur={() => setHoveredModuleId((current) => (current === module.id ? null : current))}
              onClick={(event) => {
                if (module.id !== 'vision') {
                  return
                }
                event.preventDefault()
                openVision()
              }}
              aria-label={`${module.label}: ${module.title}`}
            >
              <div className="relative h-28 w-28">
                <div
                  className="absolute inset-0 rounded-full opacity-0 transition duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                  style={{
                    background: `radial-gradient(circle, ${alpha(module.rgb, voice === 'glitch' ? 0.46 : 0.34)} 0%, ${alpha(
                      activeVoice.accentRgb,
                      voice === 'rocket' ? 0.22 : 0.16,
                    )} 40%, ${alpha(module.rgb, 0)} 74%)`,
                  }}
                />
                <div
                  className={`absolute inset-[18px] rounded-full border opacity-0 transition duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 ${
                    voice === 'glitch' ? 'group-hover:animate-pulse' : ''
                  }`}
                  style={{
                    borderColor: alpha(module.rgb, 0.95),
                    boxShadow: `0 0 24px ${alpha(module.rgb, 0.55)}, 0 0 20px ${alpha(activeVoice.accentRgb, 0.40)}, 0 0 2px ${alpha(
                      module.rgb,
                      0.95,
                    )} inset`,
                  }}
                />
                <div
                  className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition group-hover:bg-white group-focus-visible:bg-white"
                  style={{ backgroundColor: alpha(activeVoice.accentRgb, 0.22) }}
                />
              </div>

              <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-60 -translate-x-1/2 rounded-lg border border-slate-700/60 bg-slate-950/92 p-3 text-center opacity-0 shadow-[0_10px_40px_rgba(2,6,23,0.75)] transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                <p className="mt-1 text-sm font-semibold text-slate-100">{module.title}</p>
                <p className="text-[11px] tracking-[0.16em] text-slate-400">{module.label}</p>
              </div>
            </Link>
          ))}

          <div
            className={`pointer-events-none absolute inset-0 z-20 transition-all duration-500 ${
              isVisionExpanded ? 'bg-slate-950/60 backdrop-blur-[3px]' : 'bg-transparent backdrop-blur-0'
            }`}
          />

          <aside
            className={`absolute top-[9%] z-30 h-[76%] overflow-hidden rounded-2xl border border-cyan-400/35 bg-slate-950/78 shadow-[0_0_30px_rgba(0,220,255,0.2)] backdrop-blur-md transition-all duration-500 ${
              isVisionOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
            }`}
            style={{
              width: isVisionExpanded ? '80%' : '20%',
              minWidth: isVisionExpanded ? undefined : '300px',
              left: isVisionExpanded ? '10%' : undefined,
              right: isVisionExpanded ? undefined : '4%',
              transformOrigin: 'right center',
              transform: isVisionOpen
                ? isVisionExpanded
                  ? 'rotateY(-4deg) scale(1.02)'
                  : 'rotateY(-14deg) scale(1)'
                : 'rotateY(0deg) scale(0.84)',
            }}
            aria-hidden={!isVisionOpen}
          >
            <div className="flex h-full min-h-0">
              <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex items-center justify-between border-b border-cyan-300/20 bg-slate-900/75 px-4 py-3">
                  <div>
                    <p className="text-xs tracking-[0.14em] text-cyan-300">LAUNCHPAD 4 VISION</p>
                    <p className="text-sm text-slate-300">⚓ Anchor · Strategic Intelligence</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={isVisionExpanded ? collapseVision : expandVision}
                      className="rounded-md border border-cyan-400/40 px-3 py-1.5 text-xs text-cyan-200 transition hover:border-cyan-300 hover:text-white"
                    >
                      {isVisionExpanded ? 'Working Mode' : 'Expand'}
                    </button>
                    <button
                      type="button"
                      onClick={closeVision}
                      className="rounded-md border border-slate-600 px-3 py-1.5 text-xs text-slate-300 transition hover:border-slate-400 hover:text-white"
                    >
                      Close
                    </button>
                  </div>
                </header>
                <div className="border-b border-cyan-300/15 bg-slate-900/55 px-4 py-2 text-xs text-slate-300">
                  Mission Context: <span className="text-cyan-200">Launch → Funnel → Optimization</span>
                </div>
                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 text-sm text-slate-200">
                  <div className="rounded-lg border border-cyan-400/20 bg-slate-900/55 p-3">
                    <p className="text-cyan-200">Vision online. Working mode active (20%).</p>
                    <p className="mt-1 text-slate-300">You can continue interacting with cockpit modules behind this panel.</p>
                  </div>
                  <div className="rounded-lg border border-slate-700/70 bg-slate-900/55 p-3">
                    <p className="text-slate-200">Use <strong>Expand</strong> to enter Command Mode (80%).</p>
                  </div>
                </div>
              </div>
              {isVisionExpanded ? (
                <aside className="hidden w-56 shrink-0 border-l border-cyan-400/20 bg-slate-900/86 p-3 md:block">
                  <p className="mb-2 text-xs tracking-[0.14em] text-cyan-300">VISION DOCK</p>
                  <div className="space-y-2 text-xs text-slate-200">
                    <div className="rounded-md border border-cyan-400/20 bg-slate-950/70 px-2 py-2">Insights</div>
                    <div className="rounded-md border border-cyan-400/20 bg-slate-950/70 px-2 py-2">Saved Ideas</div>
                    <div className="rounded-md border border-cyan-400/20 bg-slate-950/70 px-2 py-2">Alerts</div>
                    <div className="rounded-md border border-cyan-400/20 bg-slate-950/70 px-2 py-2">Strategy</div>
                  </div>
                </aside>
              ) : null}
            </div>
          </aside>

          <aside
            className="pointer-events-none absolute bottom-4 left-4 w-[min(460px,calc(100%-2rem))] rounded-xl bg-slate-950/75 p-4 backdrop-blur-md"
            style={{ borderColor: alpha(activeVoice.accentRgb, 0.35), borderWidth: '1px', borderStyle: 'solid' }}
          >
            <p className="text-[11px] tracking-[0.16em]" style={{ color: alpha(activeVoice.accentRgb, 0.95) }}>
              ACTIVE MODULE
            </p>
            {activeModule ? (
              <>
                <p className="mt-1 text-sm font-semibold text-slate-100">{activeModule.title}</p>
                <p className="mt-1 text-xs text-slate-300">{activeModule.description}</p>
                <p className="mt-2 text-[11px] text-slate-400">
                  Voice: {activeVoice.label} · {activeVoice.description}
                </p>
              </>
            ) : (
              <p className="mt-1 text-xs text-slate-400">No module illuminated. Hover over cockpit instruments to reveal controls.</p>
            )}
          </aside>
        </section>
      </div>
    </main>
  )
}
