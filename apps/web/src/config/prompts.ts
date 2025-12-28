import { BRAND_MODES, BrandModeKey } from "@/contexts/BrandModeContext";
import { FUNNEL_STEP_INTENT } from "./funnelFlow";

export const CREATIVE_DIRECTOR_PROMPT = `
You are a ruthless creative director.

Rules:
- Remove hype.
- Cut generic phrases.
- Shorten headlines.
- One clear CTA only.
- If it sounds desperate, delete it.
- Calm confidence beats persuasion.

You may only REMOVE or SIMPLIFY text.
Do not add new content.
`;

export const creativeDirectorPrompt = CREATIVE_DIRECTOR_PROMPT;

export function buildStepPrompt({
  step,
  brandMode,
  productName,
  audience,
}: {
  step: keyof typeof FUNNEL_STEP_INTENT;
  brandMode: BrandModeKey;
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
