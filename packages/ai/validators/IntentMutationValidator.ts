import type { ValidationIssue } from './types'

export function findIntentMutation(
  requestedIntent: string,
  generatedIntent: string,
): ValidationIssue[] {
  const normalizedRequested = requestedIntent.trim().toLowerCase()
  const normalizedGenerated = generatedIntent.trim().toLowerCase()

  if (!normalizedRequested || !normalizedGenerated) {
    return []
  }

  if (normalizedRequested === normalizedGenerated) {
    return []
  }

  return [
    {
      id: 'intent-mutation',
      severity: 'violation',
      message: 'Generated output intent does not match the requested intent.',
    },
  ]
}
