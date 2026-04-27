import WorkspaceLoadingState from '@/components/ui/WorkspaceLoadingState'

export default function SettingsSkeleton() {
  return (
    <WorkspaceLoadingState
      shellClassName="page-command-authority"
      sectionLabel="Settings"
      titleWidthClass="w-72"
      cardCount={3}
      panelCount={2}
      message="Loading account settings..."
    />
  )
}
