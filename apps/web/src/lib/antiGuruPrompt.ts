export function buildAntiGuruPrompt(productName: string) {
  return `
You are writing an Anti-Guru comparison section.

Tone:
- Honest
- Slightly sarcastic
- Calm, not angry
- Confident enough to say no

Purpose:
List common marketing promises that ${productName} explicitly does NOT make,
followed by what it does instead.

Rules:
- No insults
- No named competitors
- No income claims
- Humor must feel grounded, not snarky

Return JSON:
{
  "intro": "Short framing statement",
  "items": [
    {
      "not": "What others promise",
      "instead": "What we actually do"
    }
  ]
}
`
}

export const ANTIGURU_FALLBACK = {
  intro:
    "There's a lot of loud promises in this space. We decided to be specific instead.",
  items: [
    {
      not: '"Make money while you sleep."',
      instead:
        "Build systems that work when you show up—and keep working when you don't."
    },
    {
      not: '"No work required."',
      instead:
        'Clear steps, real tools, and automation that removes friction—not effort.'
    },
    {
      not: '"Just copy my funnel."',
      instead:
        "Understand why funnels work so you're not stuck copying forever."
    },
    {
      not: '"Guaranteed results."',
      instead:
        'Transparent systems that succeed or fail honestly.'
    }
  ]
}
