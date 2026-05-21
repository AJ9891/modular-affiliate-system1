import FunnelRenderer from '@/components/FunnelRenderer'
import { FunnelBlock } from '@/lib/types'

interface RenderFunnelProps {
  funnel: any
}

function extractBlocks(rawBlocks: unknown): FunnelBlock[] {
  let parsed: unknown = rawBlocks

  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed)
    } catch {
      return []
    }
  }

  if (Array.isArray(parsed)) {
    return parsed as FunnelBlock[]
  }

  if (parsed && typeof parsed === 'object') {
    const candidate = (parsed as { blocks?: unknown }).blocks
    if (Array.isArray(candidate)) {
      return candidate as FunnelBlock[]
    }
  }

  return []
}

export default function RenderFunnel({ funnel }: RenderFunnelProps) {
  const blocks = extractBlocks(funnel?.blocks)

  return <FunnelRenderer blocks={blocks} />
}
