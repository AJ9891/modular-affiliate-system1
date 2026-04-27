import WorkspaceLoadingState from '@/components/ui/WorkspaceLoadingState'

export default function AdminSkeleton() {
  return (
    <WorkspaceLoadingState
      shellClassName="page-command-authority"
      sectionLabel="Admin"
      titleWidthClass="w-80"
      cardCount={5}
      panelCount={1}
      message="Loading command analytics..."
    />
  )
}
