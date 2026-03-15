type TelemetryPayload = {
  event: string
  props?: Record<string, any>
  ts?: number
}

const endpoint = '/api/telemetry'

export function trackEvent(event: string, props?: Record<string, any>) {
  if (typeof window === 'undefined') return
  const payload: TelemetryPayload = { event, props, ts: Date.now() }

  try {
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, blob)
      return
    }
  } catch {
    // fall back to fetch
  }

  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true
  }).catch(() => {
    /* ignore */
  })
}

export function trackPageView(path?: string) {
  trackEvent('page_view', {
    path: path ?? (typeof window !== 'undefined' ? window.location.pathname : undefined),
    referrer: typeof document !== 'undefined' ? document.referrer : undefined
  })
}
