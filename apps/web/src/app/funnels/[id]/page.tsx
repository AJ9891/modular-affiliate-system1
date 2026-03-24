import FunnelEditorWorkspace from '@/components/funnels/FunnelEditorWorkspace'

interface FunnelEditorPageProps {
  params: Promise<{ id: string }>
}

export default async function FunnelEditorPage({ params }: FunnelEditorPageProps) {
  const { id } = await params
  return <FunnelEditorWorkspace id={id} />
}
