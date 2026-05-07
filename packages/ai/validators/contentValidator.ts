import { invalid, valid, type ValidationIssue, type ValidationResult } from './Validation.types'

const MAX_CONTENT_LENGTH = 6000

export function validateUserContent(content?: string): ValidationResult<string | undefined> {
  if (typeof content === 'undefined') return valid(undefined)

  const issues: ValidationIssue[] = []
  const normalized = content.trim()

  if (normalized.length === 0) {
    issues.push({ field: 'userContent', message: 'userContent cannot be empty when provided' })
  }
  if (normalized.length > MAX_CONTENT_LENGTH) {
    issues.push({
      field: 'userContent',
      message: `userContent exceeds ${MAX_CONTENT_LENGTH} character limit`
    })
  }
  if (normalized.includes('\u0000')) {
    issues.push({
      field: 'userContent',
      message: 'userContent contains null-byte characters'
    })
  }

  return issues.length > 0 ? invalid(issues) : valid(normalized)
}
