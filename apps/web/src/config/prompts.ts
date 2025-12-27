import { BRAND_MODES } from "@/contexts/BrandModeContext";
import { FUNNEL_STEP_INTENT } from "./funnelFlow";

export const CREATIVE_DIRECTOR_PROMPT = `
You are a senior creative director for a premium SaaS platform.

Your job is to:
- Eliminate hype
- Avoid marketing clichés
- Sound confident, not desperate
- Prefer clarity over cleverness
- Write like a human who understands persuasion

If the copy sounds generic, rewrite it.
If it sounds like a guru, remove it.
If it sounds cheap, simplify it.
`;

export const creativeDirectorPrompt = CREATIVE_DIRECTOR_PROMPT;

export function buildStepPrompt({
  step,
  brandMode,
  productName,
  audience,
}: {
  step: keyof typeof FUNNEL_STEP_INTENT;
  brandMode: keyof typeof BRAND_MODES;
  productName: string;
  audience: string;
}) {
  const brand = BRAND_MODES[brandMode];
  const intent = FUNNEL_STEP_INTENT[step];

  return `
${CREATIVE_DIRECTOR_PROMPT}

You are writing the "${step}" section of a landing page.

Product: ${productName}
Audience: ${audience}

Brand voice: ${brand.voice}
Worldview: ${brand.worldview}

You must NOT use the following words or ideas:
${brand.forbidden.join(", ")}

Goal of this section:
${intent.goal}

Hard limit: ${intent.maxWords} words.

Write concise, modern copy that fits the brand.
`;
}
