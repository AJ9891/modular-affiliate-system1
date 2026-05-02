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
 * Get email automation activation link with affiliate tracking
 */
export function getEmailAutomationLink(userId?: string | null, source: string = 'dashboard') {
  const affiliateLink = process.env.NEXT_PUBLIC_EMAIL_AUTOMATION_AFFILIATE_LINK || 'https://launchpad4success.pro/email'
  
  // Track the click
  if (typeof window !== 'undefined') {
    trackAffiliateClick('email_automation', source, userId)
  }
  
  return affiliateLink
}
