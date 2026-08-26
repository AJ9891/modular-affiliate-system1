import type { Metadata } from 'next'
import IntegrationsWorkspace from '@/components/integrations/IntegrationsWorkspace'

export const metadata: Metadata = {
  title: 'Publishing Integrations',
  description: 'Connect private webhook destinations for Launchpad campaign publishing.',
}

export default function IntegrationsPage() {
  return <IntegrationsWorkspace />
}
