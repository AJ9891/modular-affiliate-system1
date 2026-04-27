import WorkspaceLoadingState from '@/components/ui/WorkspaceLoadingState'

export default function DashboardSkeleton() {
  return (
    <WorkspaceLoadingState
      shellClassName="page-mission-control"
      sectionLabel="Dashboard"
      titleWidthClass="w-64"
      cardCount={4}
      panelCount={2}
      message="Loading dashboard telemetry..."
    />
  )
}
