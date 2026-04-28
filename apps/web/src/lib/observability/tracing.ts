import { createLogger } from '@/lib/observability/logger'

export async function withTrace<T>(
  operation: string,
  run: () => Promise<T>,
  meta?: Record<string, unknown>
): Promise<T> {
  const scopedLogger = createLogger('trace')
  const startedAt = Date.now()

  try {
    const result = await run()
    scopedLogger.debug('operation_succeeded', {
      operation,
      durationMs: Date.now() - startedAt,
      ...meta,
    })
    return result
  } catch (error) {
    scopedLogger.error('operation_failed', {
      operation,
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
      ...meta,
    })
    throw error
  }
}
