import { assemblePrompt } from '../prompts/PromptAssembler'
import type { PromptAssemblyInput } from '../prompts/Prompt.types'
import { AIClient } from './AIClient'
import { lintResponse } from '../linting/ResponseLinter'

export class AIService {
  constructor(private client = new AIClient()) {}

  async generate(input: PromptAssemblyInput) {
    const { prompt, metadata } = assemblePrompt(input)
    const response = await this.client.generate({ system: input.voiceHeader.system, prompt })
    const lint = lintResponse(response.content)

    return {
      prompt,
      metadata,
      response: response.content,
      lint
    }
  }
}
