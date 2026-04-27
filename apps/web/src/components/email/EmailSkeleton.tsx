import WorkspaceLoadingState from '@/components/ui/WorkspaceLoadingState'

export default function EmailSkeleton() {
  return (
    <WorkspaceLoadingState
      shellClassName="page-crew"
      sectionLabel="Email"
      titleWidthClass="w-72"
      cardCount={3}
      panelCount={2}
      message="Loading email workspace..."
    />
  )
}
