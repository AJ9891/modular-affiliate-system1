import FunnelRenderer from '@/components/FunnelRenderer'
import { FunnelBlock } from '@/lib/types'

interface RenderFunnelProps {
  funnel: any
}

export default function RenderFunnel({ funnel }: RenderFunnelProps) {
  // Parse blocks from the funnel data
  const blocksData = typeof funnel.blocks === 'string'
    ? JSON.parse(funnel.blocks)
    : funnel.blocks

  const blocks: FunnelBlock[] = blocksData.blocks || []

  return <FunnelRenderer blocks={blocks} />
}