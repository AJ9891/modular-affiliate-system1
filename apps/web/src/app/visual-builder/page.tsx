'use client'

import EnhancedFunnelBuilder from '@/components/EnhancedFunnelBuilder'
import { useSearchParams } from 'next/navigation'

export const runtime = 'edge'

export default function VisualBuilderPage() {
  const searchParams = useSearchParams()
  const niche = searchParams.get('niche') || 'general'
  const rawFunnelId = searchParams.get('funnelId')
  
  // Handle 'new' funnelId case - treat as null for new funnel creation
  const funnelId = rawFunnelId === 'new' ? null : rawFunnelId
  
  console.log('[VisualBuilderPage] URL params:', { 
    niche, 
    rawFunnelId, 
    processedFunnelId: funnelId 
  })
  
  return (
    <div className="theme-engineering min-h-screen">
      <div className="px-6 py-6 md:px-10 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/70">Engineering Bay</p>
          <h1 className="text-2xl font-semibold text-white">Visual Builder</h1>
          <p className="text-sm text-white/70">Structural assembly in visual mode.</p>
        </div>
        <div className="text-right text-white/60 text-xs">
          Visual Mode · Structural Assembly
          <br />
          For raw JSON, use Builder V2
        </div>
      </div>
      <EnhancedFunnelBuilder initialNiche={niche} funnelId={funnelId} />
    </div>
  )
}
