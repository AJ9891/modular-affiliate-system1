import { sanitizeUserInput } from './sanitizeInput'

export async function runAiTask({
  prompt,
  userInput,
}: {
  prompt: string
  userInput?: string
}): Promise<string> {
  const cleanedInput = userInput
    ? sanitizeUserInput(userInput)
    : undefined

  const finalPrompt = cleanedInput
    ? `${prompt}\n\nSANITIZED USER INPUT:\n${cleanedInput}`
    : prompt

  // call OpenAI / model here
  const response = await callModel(finalPrompt)

  return response
}

async function callModel(prompt: string): Promise<string> {
  // This would call your actual AI service (OpenAI, Anthropic, etc.)
  // For now, returning a placeholder
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })

  if (!response.ok) {
    throw new Error('AI generation failed')
  }

  const data = await response.json()
  return data.result
}
