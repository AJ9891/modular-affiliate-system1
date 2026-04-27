import WorkspaceLoadingState from '@/components/ui/WorkspaceLoadingState'

export default function AnalyticsSkeleton() {
  return (
    <WorkspaceLoadingState
      shellClassName="page-telemetry"
      sectionLabel="Analytics"
      titleWidthClass="w-72"
      cardCount={4}
      panelCount={2}
      message="Loading analytics summary..."
    />
  )
}
