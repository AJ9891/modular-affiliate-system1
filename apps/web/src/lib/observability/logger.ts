type Level = 'debug' | 'info' | 'warn' | 'error'

const REDACT_KEYS = new Set([
  'password',
  'token',
  'access_token',
  'refresh_token',
  'authorization',
  'cookie',
  'api_key',
  'secret',
  'stripe_signature',
])

const MAX_DEPTH = 4

function redactValue(value: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH) return '[truncated]'

  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, depth + 1))
  }

  if (value && typeof value === 'object') {
    const input = value as Record<string, unknown>
    const output: Record<string, unknown> = {}
    for (const [key, child] of Object.entries(input)) {
      if (REDACT_KEYS.has(key.toLowerCase())) {
        output[key] = '[redacted]'
      } else {
        output[key] = redactValue(child, depth + 1)
      }
    }
    return output
  }

  if (typeof value === 'string' && value.length > 2000) {
    return `${value.slice(0, 2000)}...`
  }

  return value
}

function emit(level: Level, message: string, meta?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'test') return

  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...(meta ? { meta: redactValue(meta) } : {}),
  }

  const line = JSON.stringify(payload)
  if (level === 'debug') {
    // eslint-disable-next-line no-console
    console.log(line)
    return
  }
  // eslint-disable-next-line no-console
  console[level](line)
}

export function createLogger(scope?: string) {
  const withScope = (meta?: Record<string, unknown>) => (scope ? { scope, ...meta } : meta)

  return {
    debug: (message: string, meta?: Record<string, unknown>) => emit('debug', message, withScope(meta)),
    info: (message: string, meta?: Record<string, unknown>) => emit('info', message, withScope(meta)),
    warn: (message: string, meta?: Record<string, unknown>) => emit('warn', message, withScope(meta)),
    error: (message: string, meta?: Record<string, unknown>) => emit('error', message, withScope(meta)),
  }
}

export const logger = createLogger()
