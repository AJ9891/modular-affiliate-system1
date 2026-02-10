import { openai, AI_MODELS } from './openai'

type GenerateContentOptions = {
  temperature?: number
  max_tokens?: number
}

// Simple prompt-based generator for optimization workflows.
export async function generateContent(prompt: string, options: GenerateContentOptions = {}): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI API not configured. Please set OPENAI_API_KEY environment variable.')
  }

  const completion = await openai.chat.completions.create({
    model: AI_MODELS.GPT35,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 500,
  })

  return completion.choices[0]?.message?.content || ''
}
