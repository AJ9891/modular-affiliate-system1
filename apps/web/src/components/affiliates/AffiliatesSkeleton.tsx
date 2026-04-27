import WorkspaceLoadingState from '@/components/ui/WorkspaceLoadingState'

export default function AffiliatesSkeleton() {
  return (
    <WorkspaceLoadingState
      shellClassName="page-fuel-management"
      sectionLabel="Affiliates"
      titleWidthClass="w-80"
      cardCount={4}
      panelCount={1}
      message="Loading affiliate tracking..."
    />
  )
}
