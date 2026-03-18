// Placeholder logging hook; replace with Sentry/Datadog as needed.
export function logError(error: unknown, context?: Record<string, any>) {
  try {
    console.error('[app-error]', error, context)
  } catch {
    // ignore
  }
}
