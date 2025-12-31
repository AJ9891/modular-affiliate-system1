import { resolvePrompt } from '@/lib/ai-generator';

const prompt = resolvePrompt('ai_meltdown', {
  productName: 'My Funnel',
  audience: 'new affiliate marketers',
  goal: 'explain the platform honestly',
  pageType: 'hero'
});

// Pass to OpenAI
const response = await openai.chat.completions.create({
  messages: [
    { role: 'system', content: prompt.system },
    { role: 'user', content: prompt.user }
  ]
});
