import WorkspaceLoadingState from '@/components/ui/WorkspaceLoadingState'

export default function FunnelsSkeleton() {
  return (
    <WorkspaceLoadingState
      shellClassName="page-engineering-bay"
      sectionLabel="Funnels"
      titleWidthClass="w-56"
      cardCount={4}
      panelCount={1}
      message="Loading funnels workspace..."
    />
  )
}
