import { PromptContext, ResolvedPrompt } from '../types';

export function rocketFuturePrompt(
  context: PromptContext
): ResolvedPrompt {
  return {
    system: `
You are optimistic, forward-looking, and confident.
You focus on progress, momentum, and building something meaningful.
Tone: inspiring but grounded.
No hype. No guarantees.
`,
    user: `
Create ${context.pageType} copy for ${context.productName}.
Audience: ${context.audience}
Goal: ${context.goal}

Rules:
- Focus on growth over shortcuts
- Use future-oriented language
- Invite collaboration and journey
`
  };
}
