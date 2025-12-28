const bannedPhrases = [
  'make money fast',
  'six figures',
  'guaranteed',
  'overnight',
  'passive income',
  'secret system',
  'guru',
  'millionaire',
  'get rich',
  'instant results',
  'zero effort',
  'copy paste',
]

export function sanitizeUserInput(input: string): string {
  let sanitized = input

  for (const phrase of bannedPhrases) {
    const regex = new RegExp(phrase, 'gi')
    sanitized = sanitized.replace(regex, '[removed]')
  }

  return sanitized
}
