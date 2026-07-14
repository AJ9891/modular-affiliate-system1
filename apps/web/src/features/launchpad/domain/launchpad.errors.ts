export type LaunchpadErrorCode =
  | 'VALIDATION_FAILED'
  | 'AUTHENTICATION_REQUIRED'
  | 'CAPACITY_REACHED'
  | 'CONFLICT_DETECTED'
  | 'NETWORK_INTERRUPTED'
  | 'PROVIDER_UNAVAILABLE'
  | 'DATABASE_UNAVAILABLE'
  | 'UNKNOWN'

export type LaunchpadError = {
  code: LaunchpadErrorCode
  message: string
  retryable: boolean
  requestId?: string
}

type ErrorCandidate = {
  code?: unknown
  message?: unknown
  status?: unknown
}

function candidate(error: unknown): ErrorCandidate {
  return error && typeof error === 'object' ? error as ErrorCandidate : {}
}

export function toLaunchpadError(error: unknown): LaunchpadError {
  const value = candidate(error)
  const message = typeof value.message === 'string' ? value.message.toLowerCase() : ''
  const status = typeof value.status === 'number' ? value.status : null

  if (status === 401 || status === 403) {
    return {
      code: 'AUTHENTICATION_REQUIRED',
      message: 'Please sign in again before continuing your launch.',
      retryable: false,
    }
  }

  if (status === 402 || message.includes('capacity')) {
    return {
      code: 'CAPACITY_REACHED',
      message: 'Your current plan has reached its active Launchpad limit.',
      retryable: false,
    }
  }

  if (status === 409 || message.includes('another session')) {
    return {
      code: 'CONFLICT_DETECTED',
      message: 'This Launchpad changed in another tab. Refresh before continuing.',
      retryable: false,
    }
  }

  if (status === 400 || status === 422) {
    return {
      code: 'VALIDATION_FAILED',
      message: 'Review the highlighted launch details before continuing.',
      retryable: false,
    }
  }

  if (status !== null && status >= 500) {
    return {
      code: 'PROVIDER_UNAVAILABLE',
      message: 'A connected service is taking longer than expected. Your saved work is still safe.',
      retryable: true,
    }
  }

  return {
    code: 'UNKNOWN',
    message: 'Something interrupted the launch. Your saved work is still safe.',
    retryable: true,
  }
}
