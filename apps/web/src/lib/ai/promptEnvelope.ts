import { BrandMode } from '@/contexts/BrandModeContext'

export function buildPromptEnvelope({
  brand,
  task,
  userInput,
  outputSchema,
}: {
  brand: BrandMode
  task: string
  userInput?: string
  outputSchema: string
}) {
  return `
SYSTEM ROLE:
You are an AI assistant operating inside a product platform.
You must follow ALL rules below.

BRAND MODE RULES:
${brand.aiPrompt}

GLOBAL HARD RULES:
- No income claims
- No guarantees
- No hype language
- No guru tone
- No urgency manipulation
- No emojis unless explicitly allowed
- No exaggeration
- Humor must increase trust, not reduce it

TASK:
${task}

USER INPUT (optional):
${userInput ?? 'None'}

OUTPUT FORMAT (MANDATORY):
${outputSchema}

If you cannot comply exactly, return a safe alternative that still follows the rules.
`
}
