export type PublishedFunnelRecord = {
  funnel_id: unknown
  user_id: unknown
  status: unknown
  active: unknown
}

export function resolvePublishedFunnel(
  funnel: PublishedFunnelRecord | null,
  requestedFunnelId: string
): { funnelId: string; ownerUserId: string } | null {
  if (
    !funnel ||
    funnel.funnel_id !== requestedFunnelId ||
    funnel.status !== 'published' ||
    funnel.active !== true ||
    typeof funnel.user_id !== 'string' ||
    !funnel.user_id
  ) {
    return null
  }

  return { funnelId: requestedFunnelId, ownerUserId: funnel.user_id }
}
