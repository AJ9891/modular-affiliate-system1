type Level = 'debug' | 'info' | 'warn' | 'error'

const DISABLED = process.env.NODE_ENV === 'test'

function emit(level: Level, message: string, meta?: Record<string, unknown>) {
  if (DISABLED) return
  const payload = meta ? { message, ...meta } : message
  const prefix = `[${level.toUpperCase()}]`
  // eslint-disable-next-line no-console
  console[level === 'debug' ? 'log' : level](prefix, payload)
}

export const log = {
  debug: (msg: string, meta?: Record<string, unknown>) => emit('debug', msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => emit('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => emit('warn', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => emit('error', msg, meta),
}
