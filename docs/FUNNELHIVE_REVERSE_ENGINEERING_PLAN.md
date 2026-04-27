# FunnelHive Reverse-Engineering Plan (Launchpad-Styled Integration)

## Scope & Constraints

This plan reverse-engineers the **observable behavior** of `https://funnelhive.polsia.app/app` and adapts it into this repository with these implementation rules:

1. **Keep Launchpad system styling** (no new design language).
2. **Primary delivery target:** AI funnel generation from URL.
3. **Allowed extension (phase 2):** automatic optimization, A/B testing, and automatic winner implementation.

No proprietary code is copied; only behavior and workflow are replicated.

---

## STEP 1 — UI & UX ANALYSIS

## Observed structure

### `/` (marketing)

- High-level pitch page with CTA into app flow.
- Messaging emphasizes quick affiliate funnel generation.

### `/app` (generator)

- Single-purpose centered workflow:
  - URL input field (affiliate/product link)
  - Generate button
  - Progressive generation status steps
  - Generated assets area (landing + email sequence)
  - Copy/regenerate actions

## Navigation

- Shallow navigation from marketing to generator.

## User flow

1. Enter offer URL.
2. Run generation.
3. Watch staged progress.
4. Review generated assets.
5. Copy assets / regenerate.

---

## STEP 2 — FEATURE EXTRACTION

## Core (phase 1)

1. **AI funnel generation from URL**
2. **Staged progress feedback**
3. **Generated asset presentation**
   - Landing-page copy structure
   - 3-email sequence structure
4. **Utility actions**
   - Copy output
   - Regenerate

## Expansion (phase 2)

1. **Automatic funnel optimization**
2. **A/B testing (variant traffic split + metrics)**
3. **Automatic winner implementation** (with safety controls)

---

## STEP 3 — SYSTEM DESIGN (Repo-Adapted)

## Styling requirement: Launchpad visual system only

Use existing Launchpad/Cockpit tokens, panels, spacing, and button patterns from existing UI components.

## Frontend

### Route

- **Create:** `apps/web/src/app/link-funnel/page.tsx`
  - Launchpad shell layout
  - URL input + submit
  - progress state
  - output tabs/cards

### Components

- **Create:** `apps/web/src/components/funnels/LinkIngestionForm.tsx`
- **Create:** `apps/web/src/components/funnels/GenerationProgress.tsx`
- **Create:** `apps/web/src/components/funnels/GeneratedAssetsTabs.tsx`

### Reuse existing styles/components

- `DashboardPanel` / `WorkspacePanel` patterns
- Existing Launchpad typography and CTA classes

## Backend

### Core endpoint

- **Create:** `POST /api/funnels/generate-from-url`
  - Input: `{ url, nicheHint?, audienceHint?, tone? }`
  - Steps:
    1. fetch/sanitize target page text
    2. extract offer signals
    3. generate landing + email assets
    4. persist funnel + generated artifacts
    5. return structured response

### Supporting endpoint

- **Create:** `POST /api/funnels/:id/regenerate`

## Database

### Core tables

1. `funnel_generations`
   - id, user_id, funnel_id, source_url, status, started_at, completed_at, error_message
2. `generated_assets`
   - id, generation_id, asset_type, content_json, content_text

### Reuse tables

- `funnels` and `pages`
- `leads`, `clicks`, `conversions` for performance telemetry

---

## STEP 4 — Launchpad Analytics Compatibility Check

## Verdict

**Partially compatible now; requires schema/route alignment fixes before reliable production analytics for generated funnels.**

## What already aligns

1. Dashboard metrics are driven from `/api/analytics` and consumed by existing dashboard APIs/components.
2. Analytics endpoint supports `funnelId` filtering, which matches generated funnel tracking needs.
3. Lead capture and click/conversion tracking routes already write to `leads`, `clicks`, and `conversions`.

## Gaps to fix (important)

1. `GET /api/analytics` filters `leads`/`clicks` by `user_id`, but write paths do not consistently write `user_id`.
2. `GET /api/analytics` filters by `created_at` in `clicks`, while click tracking writes `clicked_at`.
3. Conversion counting currently relies on `leads.converted` and revenue on `leads.revenue`; those may not reflect conversion records from `/api/track/conversion` unless synchronized.

## Required compatibility fixes

1. Ensure `user_id` is present and indexed on tracked rows used by dashboard analytics.
2. Standardize click timestamp field (`created_at` or `clicked_at`) across schema and queries.
3. Reconcile conversion/revenue computation between `conversions` table and `leads` projection logic.
4. Add generation-aware dimensions (`generation_id`, optional `variant_id`) for attribution.

---

## STEP 5 — Feature Matching

## Feature A: URL → Funnel generation

- Observed behavior: one URL drives full funnel output.
- Equivalent here: single API call + generation record + Launchpad UI rendering.

## Feature B: Generation progress stages

- Observed behavior: sequential phases.
- Equivalent here: deterministic step state (`fetch`, `analyze`, `landing`, `emails`).

## Feature C: Landing + email output

- Observed behavior: direct-use generated assets.
- Equivalent here: tabbed Launchpad cards with copy actions.

## Feature D: Regeneration

- Observed behavior: rerun quickly.
- Equivalent here: regenerate endpoint with prior context.

## Feature E: Automatic optimization + A/B + winner

- Equivalent here (phase 2):
  - generate variants for selected components (headline/CTA/offer stack)
  - assign traffic split (e.g., 50/50)
  - monitor conversion window
  - auto-promote winner with threshold guardrails

---

## STEP 6 — BUILD PLAN

## Task 1 (Core UI)

- **Goal:** Launchpad-styled generator UI page.
- **Files to create:**
  - `apps/web/src/app/link-funnel/page.tsx`
  - `apps/web/src/components/funnels/LinkIngestionForm.tsx`
  - `apps/web/src/components/funnels/GenerationProgress.tsx`
  - `apps/web/src/components/funnels/GeneratedAssetsTabs.tsx`

## Task 2 (Core generation API)

- **Goal:** URL-to-funnel AI generation.
- **Files to create:**
  - `apps/web/src/app/api/funnels/generate-from-url/route.ts`
  - `apps/web/src/lib/funnels/urlIngestion.ts`
  - `apps/web/src/lib/funnels/offerSignalExtractor.ts`
  - `apps/web/src/lib/ai/tasks/generateFunnelFromOffer.ts`
- **Files to modify:**
  - `apps/web/src/lib/validators/*`

## Task 3 (Persistence)

- **Goal:** Save generations and assets.
- **Files to create:**
  - `infra/migrations/<timestamp>_funnel_generation_assets.sql`
- **Files to modify:**
  - `infra/supabase-schema.sql`

## Task 4 (Analytics compatibility patch)

- **Goal:** Make existing Launchpad analytics reliable for generated funnels.
- **Files to modify:**
  - `apps/web/src/app/api/analytics/route.ts`
  - `apps/web/src/app/api/track/click/route.ts`
  - `apps/web/src/app/api/leads/capture/route.ts`
  - `infra/supabase-schema.sql`

## Task 5 (A/B testing foundation)

- **Goal:** Run measurable variant experiments.
- **Files to create:**
  - `apps/web/src/app/api/funnels/:id/experiments/route.ts`
  - `apps/web/src/lib/funnels/experiments.ts`
  - `infra/migrations/<timestamp>_funnel_experiments.sql`

## Task 6 (Automatic winner implementation)

- **Goal:** Promote top-performing variant safely.
- **Files to create:**
  - `apps/web/src/app/api/funnels/:id/experiments/winner/route.ts`
  - `apps/web/src/lib/funnels/winnerSelection.ts`
- **Files to modify:**
  - `apps/web/src/app/api/funnels/route.ts` (apply promoted config)

## Task 7 (QA and rollout)

- **Goal:** Verify correctness and protect production.
- **Files to create:**
  - `apps/web/src/__tests__/link-funnel/*.test.ts`
  - `apps/web/src/__tests__/experiments/*.test.ts`
  - `docs/LINK_FUNNEL_RUNBOOK.md`
- **Files to modify:**
  - `README.md`
  - `apps/web/.env.example`

---

## Compliance Notes

- This plan recreates functionality only, not proprietary source.
- Launchpad styling remains the UI baseline.
- Automatic optimization/A-B/winner are included as controlled phase-2 capabilities.
