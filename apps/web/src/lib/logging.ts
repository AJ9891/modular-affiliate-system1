import { createLogger } from '@/lib/observability/logger'

const errorLogger = createLogger('error-hook')

export function logError(error: unknown, context?: Record<string, any>) {
  try {
    errorLogger.error('app_error', {
      error: error instanceof Error ? error.message : String(error),
      context,
    })
  } catch {
    // ignore
  }
}
