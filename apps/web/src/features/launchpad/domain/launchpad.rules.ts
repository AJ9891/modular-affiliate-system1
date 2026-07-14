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
  launchpads: ReadonlyArray<{ status: string }>
) {
  return launchpads.filter((launchpad) => launchpad.status !== 'archived').length
}
