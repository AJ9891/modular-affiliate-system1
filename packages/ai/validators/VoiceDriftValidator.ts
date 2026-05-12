import type { ValidationIssue } from './types'

export function findVoiceDrift(content: string, forbiddenPatterns: string[]): ValidationIssue[] {
  return forbiddenPatterns.flatMap((pattern, index) => {
    const matcher = new RegExp(pattern, 'i')
    return matcher.test(content)
      ? [
          {
            id: `voice-drift-${index}`,
            severity: 'violation' as const,
            message: `Detected forbidden voice pattern: ${pattern}`,
          },
        ]
      : []
  })
}
