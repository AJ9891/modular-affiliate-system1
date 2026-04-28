import { createLogger } from '@/lib/observability/logger'

const appLogger = createLogger('app')

export const log = {
  debug: (msg: string, meta?: Record<string, unknown>) => appLogger.debug(msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => appLogger.info(msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => appLogger.warn(msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => appLogger.error(msg, meta),
}
