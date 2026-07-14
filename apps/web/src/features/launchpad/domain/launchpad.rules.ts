export function canCreateLaunchpad({
  activeCount,
  maxLaunchpads,
}: {
  activeCount: number
  maxLaunchpads: number
}) {
  return activeCount < maxLaunchpads
}

export function canPublishLaunchpad({
  hasFunnel,
  hasOffer,
  emailReady,
  checksPassed,
}: {
  hasFunnel: boolean
  hasOffer: boolean
  emailReady: boolean
  checksPassed: boolean
}) {
  return hasFunnel && hasOffer && emailReady && checksPassed
}

export function countActiveLaunchpads(
  launchpads: ReadonlyArray<{ status: string; deleted_at?: string | null }>
) {
  return launchpads.filter(
    (launchpad) => launchpad.status !== 'archived' && !launchpad.deleted_at
  ).length
}

export function getLaunchpadWorkflowStatus({
  preflightComplete,
  checklistComplete,
  hasFunnel,
  hasOffer,
  emailReady,
  checksPassed,
  published,
}: {
  preflightComplete: boolean
  checklistComplete: boolean
  hasFunnel: boolean
  hasOffer: boolean
  emailReady: boolean
  checksPassed: boolean
  published: boolean
}) {
  if (published) return 'live' as const
  if (!preflightComplete) return 'ground-control' as const
  if (!checklistComplete) return 'preflight' as const
  if (!hasFunnel) return 'building' as const
  if (!hasOffer) return 'offer-setup' as const
  if (!emailReady) return 'email-setup' as const
  if (!checksPassed) return 'launch-checks' as const
  return 'ready-to-publish' as const
}
