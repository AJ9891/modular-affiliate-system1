import { permanentRedirect } from 'next/navigation'

export default function AnalyticsRedirectPage() {
  permanentRedirect('/radar')
}
