/**
 * Track affiliate partner clicks
 */
export async function trackAffiliateClick(
  partner: string,
  source: string,
  userId?: string | null,
  metadata?: Record<string, any>
) {
  try {
    await fetch('/api/track/affiliate-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        partner,
        source,
        metadata,
      }),
    })
  } catch (error) {
    console.error('Failed to track affiliate click:', error)
  }
}

/**
 * Get SendShark activation link with affiliate tracking
 */
export function getSendSharkLink(userId?: string | null, source: string = 'dashboard') {
  const affiliateLink = process.env.NEXT_PUBLIC_SENDSHARK_AFFILIATE_LINK || 'https://sendshark.com'
  
  // Track the click
  if (typeof window !== 'undefined') {
    trackAffiliateClick('sendshark', source, userId)
  }
  
  return affiliateLink
}
