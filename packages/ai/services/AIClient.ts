export interface AIRequest {
  system: string
  prompt: string
}

export interface AIResponse {
  content: string
}

// Minimal client stub; replace with real provider integration.
export class AIClient {
  async generate(request: AIRequest): Promise<AIResponse> {
    return { content: `stub-response for: ${request.prompt.slice(0, 80)}` }
  }
}
