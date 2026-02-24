'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useUIExpression } from '@/lib/brand-brain/useUIExpression'

const systems = [
  {
    title: 'Structural Assembly',
    description: 'Design conversion structures with controlled module composition.',
    icon: 'S',
  },
  {
    title: 'Core Intelligence',
    description: 'Generate and refine messaging with onboard AI guidance.',
    icon: 'A',
  },
  {
    title: 'Flight Telemetry',
    description: 'Track campaign health with precision performance signals.',
    icon: 'T',
  },
]

export function HeroSection() {
  const ui = useUIExpression()
  const motionEnabled = ui.hero.motionIntensity !== 'none'

  return (
    <section className="flex min-h-screen flex-col justify-center px-6 pb-12 pt-24 md:px-10 md:pt-32">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10">
        <motion.div
          className="hud-panel mission-console text-center"
          initial={motionEnabled ? { opacity: 0, y: 14 } : false}
          animate={motionEnabled ? { opacity: 1, y: 0 } : false}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        >
          <p className="system-ready justify-center">System Ready</p>
          <h1 className="mt-5 text-[42px] font-semibold leading-[1.1] tracking-[-0.02em] text-text-primary">
            Launchpad 4 Success
          </h1>
          <p className="mx-auto mt-3 max-w-[34ch] text-[15px] leading-[1.6] text-text-secondary">
            Build. Launch. Scale.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/get-started" className="btn-launch-premium px-7 py-3 text-sm">
              Initiate Launch
            </Link>
            <Link href="/builder" className="btn-secondary-premium px-7 py-3 text-sm">
              View Demo
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="grid w-full max-w-5xl gap-4 md:grid-cols-3"
          initial={motionEnabled ? { opacity: 0 } : false}
          animate={motionEnabled ? { opacity: 1 } : false}
          transition={{ duration: 0.25, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
        >
          {systems.map((system) => (
            <article key={system.title} className="hud-panel">
              <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-black/20 text-xs font-semibold tracking-system text-text-secondary">
                {system.icon}
              </div>
              <h2 className="text-lg font-semibold text-text-primary">{system.title}</h2>
              <p className="mt-2 text-[15px] leading-[1.6] text-text-secondary">{system.description}</p>
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
