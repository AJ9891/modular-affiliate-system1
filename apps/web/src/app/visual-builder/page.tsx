'use client'

import EnhancedFunnelBuilder from '@/components/EnhancedFunnelBuilder'
import { useSearchParams } from 'next/navigation'

export const runtime = 'edge'

export default function VisualBuilderPage() {
  const searchParams = useSearchParams()
  const niche = searchParams.get('niche') || 'general'
  const funnelId = searchParams.get('funnelId')
  
  return <EnhancedFunnelBuilder initialNiche={niche} funnelId={funnelId} />
}
