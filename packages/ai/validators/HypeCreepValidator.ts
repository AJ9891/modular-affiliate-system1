import type { ValidationIssue } from './types'

const HYPE_PATTERNS = [
  /best\s+ever/gi,
  /instantly\s+viral/gi,
  /guaranteed\s+success/gi,
  /dominate\s+everyone/gi,
]

export function findHypeCreep(content: string): ValidationIssue[] {
  return HYPE_PATTERNS.flatMap((pattern, index) =>
    pattern.test(content)
      ? [
          {
            id: `hype-creep-${index}`,
            severity: 'violation' as const,
            message: `Detected hype pattern: ${pattern}`,
          },
        ]
      : [],
  )
}
