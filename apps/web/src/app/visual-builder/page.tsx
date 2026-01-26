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
  
  return <EnhancedFunnelBuilder initialNiche={niche} funnelId={funnelId} />
}
