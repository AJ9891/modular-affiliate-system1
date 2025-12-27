import { buildStepPrompt } from "@/config/prompts";
import { BRAND_MODES } from "@/contexts/BrandModeContext";
import { FUNNEL_STEP_INTENT } from "@/config/funnelFlow";

interface FunnelConfig {
  brandMode: keyof typeof BRAND_MODES;
  productName: string;
  audience: string;
}

async function callAI(prompt: string): Promise<string> {
  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error('AI generation failed');
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('AI generation error:', error);
    throw error;
  }
}

export async function generateFunnelContent(
  steps: (keyof typeof FUNNEL_STEP_INTENT)[],
  config: FunnelConfig
) {
  const results: Record<string, string> = {};

  for (const step of steps) {
    const prompt = buildStepPrompt({
      step,
      ...config,
    });

    const response = await callAI(prompt);
    results[step] = response;
  }

  return results;
}
