# FunnelHive Reverse-Engineering & Integration Plan (Original Rebuild)

## Scope & Method

This document reverse-engineers the **observable behavior** of `https://funnelhive.polsia.app/app` and its public homepage, then maps an original implementation into this repository (`modular-affiliate-system1`) without copying proprietary code.

**Evidence boundary:** Public UI text and flow hints from:

- `https://funnelhive.polsia.app/app`
- `https://funnelhive.polsia.app/`

---

## STEP 1 — UI & UX ANALYSIS

## 1) Layout structure

### Public marketing page (`/`)

- Single-page marketing layout with:
  - top brand/header area
  - primary CTA button (“Try It Free” / “Generate Your First Funnel”)
  - 3-step explainer (“Paste link → AI builds funnel → collect commissions”)
  - differentiation/comparison sections
  - final CTA block
- Design intent is **minimal friction** and affiliate-first positioning.

### Generator app page (`/app`)

- Centered single-task workspace:
  - headline: “Generate your funnel”
  - one primary text input (“Affiliate / Product URL”)
  - one primary action button (“Generate Funnel”)
  - during run: progress checklist states
  - after completion: tabbed/segmented content output (Landing Page + Email sequence)
  - utility actions (copy output / regenerate)

## 2) Navigation system

- Very shallow nav:
  - Brand/home link and a single “Home” link back to the landing page.
- No evidence of deep sidebar navigation in the publicly accessible flow.

## 3) Dashboard components

From public text, dashboard references are mostly marketing claims:

- “Check analytics dashboard tomorrow”
- “real-time optimization”
- “network bridge”

No separately visible dashboard UI is publicly exposed from the tested routes.

## 4) Funnel builder interface

The observed builder is **prompt-less URL ingestion** rather than manual drag-and-drop:

- Input: affiliate/product URL
- Action: generate complete campaign assets
- Intermediate state: staged generation steps:
  - fetch product page
  - analyze offer & audience
  - write landing page copy
  - create email sequence
- Output appears as ready-to-copy assets.

## 5) Analytics displays

Explicit display on `/app` is not visible beyond generated artifacts.
Likely internal analytics are implied by claims:

- split testing
- CTA swapping
- email timing adjustments

These should be treated as **inferred capabilities** rather than directly observed UI components.

## 6) User flows

Primary observed flow:

1. User opens `/app`.
2. Pastes offer URL.
3. Clicks “Generate Funnel”.
4. Watches staged generation progress.
5. Views generated landing page and email sequence.
6. Copies output and optionally regenerates.

Secondary flow:

1. User visits homepage `/`.
2. Clicks “Try It Free” / “Start Building Now”.
3. Lands in `/app` generator flow.

---

## STEP 2 — FEATURE EXTRACTION

## Observed feature set (direct)

1. **Funnel creation via link ingestion**
   - Create funnel copy assets from a pasted affiliate/product URL.
2. **AI content synthesis pipeline**
   - Multi-step transformation from URL context to copy artifacts.
3. **Landing page copy output**
   - Generated primary page content.
4. **Email sequence output**
   - At least 3 emails: welcome, value, close (as shown in the UI text).
5. **Output utility actions**
   - Copy generated assets.
   - Regenerate from scratch.

## Inferred/marketed features (not fully visible in tested routes)

1. **Analytics tracking / performance monitoring**
2. **Auto-optimization / experimentation loops**
3. **Affiliate network aggregation (“bridge”)**
4. **Potential dashboard and offer discovery tools**

## Requested feature categories mapping

- Funnel creation: **present (observed)**
- Page editor: **not observed in `/app`; likely absent or separate**
- Analytics tracking: **inferred/marketed**
- User dashboard: **inferred/marketed**
- Automation tools: **inferred (auto-optimization)**
- Affiliate/email systems: **affiliate context + email sequence generation observed**

---

## STEP 3 — SYSTEM DESIGN (Adapted to this repository)

This repo already has strong primitives for funnels, analytics, and email workflows. The design below adds a focused “link-to-funnel” layer.

## A) Frontend components

### New route and page

- `apps/web/src/app/link-funnel/page.tsx`
  - Single-input generator UI mirroring the observed flow (original implementation).
  - Progress-step component + output tabs.

### New components

- `apps/web/src/components/funnels/LinkIngestionForm.tsx`
  - URL validation, submit handling.
- `apps/web/src/components/funnels/GenerationProgress.tsx`
  - Deterministic staged checklist.
- `apps/web/src/components/funnels/GeneratedAssetsTabs.tsx`
  - Landing page/email tabs + copy actions.
- `apps/web/src/components/funnels/GenerationHistoryList.tsx` (optional)
  - Last N generations for user convenience.

### Reuse candidates (existing)

- Existing dashboard and analytics UI for later expansion.
- Existing visual builder (`/visual-builder`) as optional post-generation editor handoff.

## B) Backend services

### New API endpoints

- `POST /api/funnels/generate-from-url`
  - Input: `{ url, tone?, audienceHint?, nicheHint? }`
  - Pipeline:
    1. fetch + sanitize page content
    2. extract offer signals
    3. run AI generation tasks
    4. persist generated artifacts
    5. return structured output

- `POST /api/funnels/:id/regenerate`
  - Re-run generation with revised constraints.

- `GET /api/funnels/:id/assets`
  - Return generated landing/email artifacts.

### Internal service modules

- `apps/web/src/lib/funnels/urlIngestion.ts`
- `apps/web/src/lib/funnels/offerSignalExtractor.ts`
- `apps/web/src/lib/ai/tasks/generateFunnelFromOffer.ts`

## C) Database schema additions

Add tables while reusing current `funnels`, `pages`, `leads`, `clicks`, `conversions` where possible.

### Proposed new tables

1. `funnel_generations`
   - `id`, `user_id`, `funnel_id`, `source_url`, `status`, `started_at`, `completed_at`, `error_message`
2. `generated_assets`
   - `id`, `generation_id`, `asset_type` (`landing`, `email_1`, `email_2`, `email_3`, etc.), `content_json`, `content_text`
3. `generation_events`
   - `id`, `generation_id`, `step_key`, `step_status`, `metadata`, `created_at`

### Existing schema alignment

- Persist finalized landing pages into existing `pages`.
- Persist funnel shell/config into existing `funnels.blocks`.
- Use existing analytics tables for traffic + conversion attribution.

## D) API contract design

### `POST /api/funnels/generate-from-url`

Request:

```json
{
  "url": "https://example.com/offer",
  "tone": "professional",
  "audienceHint": "beginners",
  "nicheHint": "marketing"
}
```

Response:

```json
{
  "generationId": "uuid",
  "funnelId": "uuid",
  "status": "completed",
  "steps": [
    { "key": "fetch", "status": "done" },
    { "key": "analyze", "status": "done" },
    { "key": "landing", "status": "done" },
    { "key": "emails", "status": "done" }
  ],
  "assets": {
    "landing": { "headline": "...", "sections": [] },
    "emails": [
      { "type": "welcome", "subject": "...", "body": "..." },
      { "type": "value", "subject": "...", "body": "..." },
      { "type": "close", "subject": "...", "body": "..." }
    ]
  }
}
```

---

## STEP 4 — MATCH FUNCTIONALITY (Feature-by-feature)

## 1) Link-based funnel generation

- How observed app works:
  - URL in, generated funnel copy out.
- Equivalent in this repo:
  - New `/link-funnel` UI + `generate-from-url` API + persistence tables.
- Adaptation detail:
  - Hook output into existing `funnels` and optionally route to `/visual-builder?funnelId=<id>`.

## 2) Staged generation progress

- How observed app works:
  - Sequential progress stages shown in UI.
- Equivalent in this repo:
  - `generation_events` updates + client polling/SSE.
- Adaptation detail:
  - Reuse current Next.js route handlers and render deterministic step states.

## 3) Landing copy + email sequence artifacts

- How observed app works:
  - Multi-asset output with copy actions.
- Equivalent in this repo:
  - `GeneratedAssetsTabs` + copy-to-clipboard utilities.
- Adaptation detail:
  - Map structured landing JSON into existing page block schema for immediate publish/edit.

## 4) Analytics linkage

- How observed app likely works:
  - Tracks performance and optimization outcomes.
- Equivalent in this repo:
  - Reuse current analytics endpoints and tables, add `generation_id`/`funnel_id` traceability.
- Adaptation detail:
  - Attribute lead/click performance back to generated campaign and show deltas in dashboard.

## 5) Automation loop (inferred)

- How observed app likely works:
  - Periodically improves copy/timing.
- Equivalent in this repo:
  - Background “optimizer” job proposes revisions and stores variants.
- Adaptation detail:
  - Keep human approval as default to avoid silent production changes.

---

## STEP 5 — BUILD PLAN (Task-by-task roadmap)

## Task 1

- **Goal:** Deliver MVP link-to-funnel UI and API.
- **Files to create:**
  - `apps/web/src/app/link-funnel/page.tsx`
  - `apps/web/src/components/funnels/LinkIngestionForm.tsx`
  - `apps/web/src/components/funnels/GenerationProgress.tsx`
  - `apps/web/src/components/funnels/GeneratedAssetsTabs.tsx`
  - `apps/web/src/app/api/funnels/generate-from-url/route.ts`
  - `apps/web/src/lib/funnels/urlIngestion.ts`
  - `apps/web/src/lib/ai/tasks/generateFunnelFromOffer.ts`
- **Files to modify:**
  - `apps/web/src/app/navigation` (if needed for route discoverability)

## Task 2

- **Goal:** Persist generation runs and assets.
- **Files to create:**
  - `infra/migrations/<timestamp>_funnel_generations.sql`
- **Files to modify:**
  - `infra/supabase-schema.sql` (canonical schema update)

## Task 3

- **Goal:** Convert generated landing artifact into first-class funnel/page objects.
- **Files to create:**
  - `apps/web/src/lib/funnels/generationMapper.ts`
- **Files to modify:**
  - `apps/web/src/app/api/funnels/route.ts` (support generated metadata)
  - `apps/web/src/app/api/pages/route.ts` (or relevant page write path)

## Task 4

- **Goal:** Add robust URL ingestion safety and quality controls.
- **Files to create:**
  - `apps/web/src/lib/funnels/contentSanitizer.ts`
  - `apps/web/src/lib/funnels/urlValidation.ts`
- **Files to modify:**
  - `apps/web/src/lib/validators/*` (request contracts)

## Task 5

- **Goal:** Integrate analytics attribution for generated funnels.
- **Files to create:**
  - `apps/web/src/lib/analytics/generationAttribution.ts`
- **Files to modify:**
  - `apps/web/src/app/api/analytics/route.ts`
  - `apps/web/src/components/dashboard/*` (add generation cohort widgets)

## Task 6

- **Goal:** Add optional optimizer loop (phase 2).
- **Files to create:**
  - `apps/web/src/app/api/optimizer/run/route.ts`
  - `apps/web/src/lib/ai/tasks/optimizeGeneratedFunnel.ts`
- **Files to modify:**
  - `apps/web/src/app/ai-optimizer/page.tsx` (or related optimizer UI)

## Task 7

- **Goal:** QA, telemetry, and rollout controls.
- **Files to create:**
  - `apps/web/src/__tests__/link-funnel/*.test.ts`
  - `docs/LINK_FUNNEL_RUNBOOK.md`
- **Files to modify:**
  - `apps/web/.env.example` (feature flags + model settings)
  - `README.md` (new route and endpoint docs)

---

## Non-Copy Compliance Notes

- This plan recreates **behavioral patterns only** (workflow, UX sequence, and feature concepts).
- No source code, markup, styling tokens, or proprietary assets are copied.
- Final implementation should use repository-native components, naming, and architecture.
