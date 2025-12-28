export const HERO_SCHEMA = `
Return valid JSON ONLY.

{
  "headline": "string, max 12 words",
  "subheadline": "string, max 30 words",
  "cta": "string, max 6 words"
}
`

export const ANTIGURU_SCHEMA = `
Return valid JSON ONLY.

{
  "intro": "string, max 40 words",
  "items": [
    {
      "not": "string, what others promise",
      "instead": "string, what we do instead"
    }
  ]
}

Minimum 3 items, maximum 6 items.
`

export const MELTDOWN_HERO_SCHEMA = `
Return valid JSON ONLY.

{
  "headline": "string, max 15 words, funny but clear",
  "subheadline": "string, max 35 words, explains product while joking",
  "cta": "string, max 8 words, reluctant but helpful"
}
`
