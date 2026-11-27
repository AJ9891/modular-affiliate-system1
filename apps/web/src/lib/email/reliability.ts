const transientErrorCodes = new Set([
  'ThrottlingException',
  'TooManyRequestsException',
  'ServiceUnavailableException',
  'InternalServerError',
  'RequestTimeout',
  'TimeoutError',
  'NetworkingError',
  'ECONNRESET',
  'ETIMEDOUT',
  'ECONNABORTED',
  'EPIPE',
  'EAI_AGAIN',
  'ENETUNREACH',
  'ECONNREFUSED',
])

export const MAX_EMAIL_ATTEMPTS = 5

export function isTransientEmailFailure(issue: unknown): boolean {
  if (!issue || typeof issue !== 'object') return false

  const error = issue as {
    name?: string
    code?: string
    $metadata?: { httpStatusCode?: number }
  }
  const status = error.$metadata?.httpStatusCode

  return (
    transientErrorCodes.has(error.name || '') ||
    transientErrorCodes.has(error.code || '') ||
    status === 408 ||
    status === 429 ||
    (typeof status === 'number' && status >= 500)
  )
}

export function getEmailRetryDelayMs(attempt: number): number {
  const exponent = Math.max(0, Math.min(Math.floor(attempt) - 1, 10))
  return Math.min(60_000 * 2 ** exponent, 60 * 60 * 1000)
}
