import { PromptContext, ResolvedPrompt } from '../types';

export function antiGuruPrompt(
  context: PromptContext
): ResolvedPrompt {
  return {
    system: `
You reject marketing hype.
You speak plainly, directly, and with confidence.
You explicitly call out common guru lies and unrealistic promises.
Tone: grounded, blunt, respectful, slightly rebellious.
`,
    user: `
Write ${context.pageType} copy for ${context.productName}.
Audience: ${context.audience}
Goal: ${context.goal}

Rules:
- List what this does NOT promise
- Emphasize effort and learning
- Be clear, not flashy
`
  };
}
