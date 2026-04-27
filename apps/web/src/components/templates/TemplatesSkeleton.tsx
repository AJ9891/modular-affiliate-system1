import WorkspaceLoadingState from '@/components/ui/WorkspaceLoadingState'

export default function TemplatesSkeleton() {
  return (
    <WorkspaceLoadingState
      shellClassName="page-ai-core"
      sectionLabel="Templates"
      titleWidthClass="w-72"
      cardCount={3}
      panelCount={1}
      message="Loading template gallery..."
    />
  )
}
