import WorkspaceLoadingState from '@/components/ui/WorkspaceLoadingState'

export default function SubscribersSkeleton() {
  return (
    <WorkspaceLoadingState
      shellClassName="page-cargo-bay"
      sectionLabel="Subscribers"
      titleWidthClass="w-64"
      cardCount={3}
      panelCount={1}
      message="Loading subscriber records..."
    />
  )
}
