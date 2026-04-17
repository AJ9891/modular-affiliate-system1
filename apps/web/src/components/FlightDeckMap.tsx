'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Compass, ChevronsUpDown, Brain, Mail, Zap } from 'lucide-react'

interface Hotspot {
  id: string
  label: string
  href: string
  icon: React.ComponentType<any>
  style: React.CSSProperties
}

export default function FlightDeckMap() {
  const hotspots: Hotspot[] = [
    {
      id: 'navigation',
      label: 'Domains & Routing',
      href: '/domains',
      icon: Compass,
      style: { top: '20%', left: '15%' }
    },
    {
      id: 'propulsion',
      label: 'Funnels',
      href: '/link-funnel',
      icon: ChevronsUpDown,
      style: { top: '30%', left: '50%' }
    },
    {
      id: 'intelligence',
      label: 'BrandBrain + Vision',
      href: '/link-funnel',
      icon: Brain,
      style: { top: '20%', left: '85%' }
    },
    {
      id: 'communications',
      label: 'Email',
      href: '/downloads',
      icon: Mail,
      style: { top: '55%', left: '20%' }
    },
    {
      id: 'fuel',
      label: 'Stripe & Plans',
      href: '/subscription',
      icon: Zap,
      style: { top: '55%', left: '80%' }
    }
  ]

  return (
    <div className="relative w-full h-[400px] mb-8">
      {/* background image should be placed at public/images/dashboard-dark.png */}
      <Image
        src="/images/dashboard-dark.png"
        alt="Flight deck background"
        fill
        className="object-cover rounded-lg"
      />

      {hotspots.map((h) => (
        <Link key={h.id} href={h.href} className="absolute" style={h.style}>
          <div
            className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-rocket-500/80 hover:bg-rocket-500 focus:outline-none focus:ring-2 focus:ring-rocket-400"
          >
            <h.icon className="text-white" size={28} />
            <span className="pointer-events-none absolute bottom-full mb-2 hidden w-max rounded bg-black/80 px-2 py-1 text-xs text-white group-hover:block">
              {h.label}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
