'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface Hotspot {
  id: string
  name: string
  label: string
  description: string
  href: string
  x: number
  y: number
  rotation: number
  // baseColor is used to compute the gradient according to personality
  baseColor: string
  icon: string
}

// note: color property is now a base keyword, actual gradient is computed
// based on the selected personality/voice. this allows the glow to change live.
const hotspots: Hotspot[] = [
  // Vision – top right large
  {
    id: 'vision',
    name: 'Launchpad 4 Vision',
    label: 'Strategic Intelligence',
    description: 'AI vision interface and chat',
    href: '/launchpad/vision-preview',
    x: 85,
    y: 15,
    rotation: 0,
    baseColor: 'cyan',
    icon: '🧠',
  },
  // Cockpit – top left large
  {
    id: 'cockpit',
    name: 'Cockpit',
    label: 'Module Access',
    description: 'Open cockpit and use the radar module',
    href: '/cockpit',
    x: 15,
    y: 15,
    rotation: 0,
    baseColor: 'red',
    icon: '📊',
  },
  // Navigation – top center medium
  {
    id: 'navigation',
    name: 'Navigation',
    label: 'Domains & Routing',
    description: 'Manage custom domains and subdomain routing',
    href: '/domains',
    x: 50,
    y: 20,
    rotation: 0,
    baseColor: 'blue',
    icon: '🧭',
  },
  // Intelligence – right middle medium
  {
    id: 'intelligence',
    name: 'Intelligence',
    label: 'Personality / Voice',
    description: 'Select system voice and behaviour',
    href: '/intelligence',
    x: 85,
    y: 50,
    rotation: 0,
    baseColor: 'purple',
    icon: '🧠',
  },
  // Fuel – left middle medium
  {
    id: 'fuel',
    name: 'Fuel',
    label: 'Stripe & Plans',
    description: 'Subscription plans and payment processing',
    href: '/subscription',
    x: 15,
    y: 50,
    rotation: 0,
    baseColor: 'orange',
    icon: '⚡',
  },
  // Communications – bottom center medium
  {
    id: 'communications',
    name: 'Communications',
    label: 'Email',
    description: 'Email campaigns and Sendshark integration',
    href: '/email',
    x: 50,
    y: 80,
    rotation: 0,
    baseColor: 'green',
    icon: '📧',
  },
  // Propulsion – bottom right small
  {
    id: 'propulsion',
    name: 'Propulsion',
    label: 'Funnels',
    description: 'Create and manage conversion funnels',
    href: '/visual-builder',
    x: 85,
    y: 85,
    rotation: 0,
    baseColor: 'purple',
    icon: '🚀',
  },
  // Settings floating bottom-right
  {
    id: 'settings',
    name: 'Settings',
    label: 'System Settings',
    description: 'Theme, voice and preferences',
    href: '/settings',
    x: 90,
    y: 90,
    rotation: 0,
    baseColor: 'gray',
    icon: '⚙️',
  },
]

type Personality = 'anchor' | 'glitch' | 'boost' | 'rocket'

// returns a Tailwind gradient string based on personality and base color
function getGradient(base: string, personality: Personality) {
  const map: Record<Personality, Record<string, string>> = {
    anchor: {
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-indigo-500 to-purple-600',
      cyan: 'from-teal-400 to-cyan-500',
      green: 'from-emerald-500 to-green-600',
      orange: 'from-yellow-500 to-orange-600',
      red: 'from-red-500 to-rose-600',
    },
    glitch: {
      blue: 'from-pink-500 to-blue-500',
      purple: 'from-pink-500 to-purple-500',
      cyan: 'from-pink-500 to-cyan-500',
      green: 'from-pink-500 to-green-500',
      orange: 'from-pink-500 to-orange-500',
      red: 'from-pink-500 to-red-500',
    },
    boost: {
      blue: 'from-green-400 to-blue-500',
      purple: 'from-green-400 to-purple-500',
      cyan: 'from-green-400 to-cyan-500',
      green: 'from-green-400 to-green-500',
      orange: 'from-green-400 to-orange-500',
      red: 'from-green-400 to-red-500',
    },
    rocket: {
      blue: 'from-red-400 to-blue-500',
      purple: 'from-red-400 to-purple-500',
      cyan: 'from-red-400 to-cyan-500',
      green: 'from-red-400 to-green-500',
      orange: 'from-red-400 to-orange-500',
      red: 'from-red-400 to-red-500',
    },
  }
  return map[personality]?.[base] || `from-${base}-500 to-${base}-600`
}

interface GaugeProps {
  hotspot: typeof hotspots[number]
  personality: Personality
  isHovered: boolean
  onHover: (id: string | null) => void
}

function Gauge({ hotspot, personality, isHovered, onHover }: GaugeProps) {
  const gradient = getGradient(hotspot.baseColor, personality)
  return (
    <motion.div
      className="absolute"
      style={{
        left: `${hotspot.x}%`,
        top: `${hotspot.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      onHoverStart={() => onHover(hotspot.id)}
      onHoverEnd={() => onHover(null)}
    >
      <Link href={hotspot.href}>
        <motion.div
          className={`relative w-24 h-24 cursor-pointer group`}
          animate={{
            scale: isHovered ? 1.2 : 1,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
        >
          {/* Outer rotating ring */}
          <motion.div
            className={`absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r ${gradient} p-px`}
            animate={{
              rotate: isHovered ? 360 : 0,
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{
              opacity: isHovered ? 1 : 0.3,
            }}
          >
            <div className="absolute inset-0 rounded-full bg-black/80 backdrop-blur-sm flex items-center justify-center border border-white/10" />
          </motion.div>

          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="text-3xl"
              animate={{
                scale: isHovered ? 1.3 : 1,
              }}
            >
              {hotspot.icon}
            </motion.div>
          </div>

          {/* Hover label and description */}
          <motion.div
            className="absolute top-full mt-4 left-1/2 -translate-x-1/2 text-center whitespace-nowrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
            transition={{ duration: 0.2 }}
            style={{ pointerEvents: 'none' }}
          >
            <div className="bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 shadow-xl">
              <p className={`font-bold text-sm bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                {hotspot.name}
              </p>
              <p className="text-xs text-gray-300 mt-1">{hotspot.label}</p>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">{hotspot.description}</p>
            </div>
          </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  )
}

export default function SystemPage() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [personality, setPersonality] = useState<Personality>('anchor')

  // background images
  const bgDark = '/Backgrounds/Dashboard dark.png'
  const bgLight = '/Backgrounds/Dashboard Light.png'

  return (
    <div className={`min-h-screen relative overflow-hidden ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      {/* background image */}
      <img
        src={theme === 'dark' ? bgDark : bgLight}
        alt="cockpit background"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl opacity-20 animate-pulse" />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent),
              linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative h-screen flex flex-col items-center justify-center px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16 z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            System Dashboard
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-4">
            Navigate through your affiliate marketing system. Hover over each instrument to explore key features.
          </p>

          {/* controls */}
          <div className="flex items-center justify-center space-x-4">
            <label className="flex items-center space-x-2 text-sm text-gray-200">
              <span>Theme</span>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'dark' | 'light')}
                className="bg-black/50 text-white px-2 py-1 rounded"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </label>
            <label className="flex items-center space-x-2 text-sm text-gray-200">
              <span>Voice</span>
              <select
                value={personality}
                onChange={(e) => setPersonality(e.target.value as Personality)}
                className="bg-black/50 text-white px-2 py-1 rounded"
              >
                <option value="anchor">Anchor</option>
                <option value="glitch">Glitch</option>
                <option value="boost">Boost</option>
                <option value="rocket">Rocket</option>
              </select>
            </label>
          </div>
        </motion.div>

        {/* Interactive hotspot container */}
        <div className="relative w-full max-w-4xl aspect-square">
          <svg
            className="absolute inset-0 w-full h-full opacity-20"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Center point */}
            <circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.5)" />
            
            {/* Connection lines to each hotspot */}
            {hotspots.map((hotspot) => (
              <line
                key={`line-${hotspot.id}`}
                x1="50"
                y1="50"
                x2={hotspot.x}
                y2={hotspot.y}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
            ))}

            {/* Concentric circles */}
            {[20, 40, 60, 80].map((r) => (
              <circle
                key={`circle-${r}`}
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="0.5"
              />
            ))}
          </svg>

          {/* Hotspots */}
          {hotspots.map((hotspot) => (
            <Gauge
              key={hotspot.id}
              hotspot={hotspot}
              personality={personality}
              isHovered={hoveredId === hotspot.id}
              onHover={setHoveredId}
            />
          ))}
        </div>

        {/* Footer hint */}
        <motion.div
          className="absolute bottom-8 text-center text-gray-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p>✨ Hover over any instrument to explore</p>
        </motion.div>
      </div>
    </div>
  )
}
